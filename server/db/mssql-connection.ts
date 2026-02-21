import sql from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

let pool: sql.ConnectionPool | null = null

const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'EmployeeManagement',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool) {
    if (pool.connected) {
      return pool
    }
    try {
      await pool.connect()
      return pool
    } catch (err) {
      console.error('Failed to reconnect existing pool', err)
      pool = null
    }
  }

  try {
    console.log(`Connecting to SQL Server at ${dbConfig.server}...`)
    pool = await sql.connect(dbConfig)
    console.log('Connected to SQL Server')
    return pool
  } catch (err) {
    console.error('Database connection failed:', err)
    throw err
  }
}

export async function query(command: string, params?: Record<string, any>) {
  const pool = await getConnection()
  const request = pool.request()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value ?? null)
    }
  }

  return request.query(command)
}

export async function queryOne(command: string, params?: Record<string, any>) {
  const result = await query(command, params)
  return result.recordset[0] || null
}

export async function close() {
  if (pool && pool.connected) {
    console.log('Closing SQL Server connection...')
    await pool.close()
    pool = null
    console.log('SQL Server connection closed')
  }
}

export async function reconnect() {
  await close()
  return getConnection()
}

export { sql }
