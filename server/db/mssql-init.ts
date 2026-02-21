import fs from 'fs'
import path from 'path'
import { query } from './mssql-connection'

export async function initializeDatabase() {
  console.log('[db] Initializing MSSQL database...')
  
  const initSqlPath = path.join(__dirname, 'mssql-init.sql')
  if (!fs.existsSync(initSqlPath)) {
    console.error('[db] mssql-init.sql not found at:', initSqlPath)
    throw new Error('mssql-init.sql not found')
  }

  const sqlContent = fs.readFileSync(initSqlPath, 'utf-8')
  
  // Split by "GO" if it exists, or just execute. 
  // The current mssql-init.sql doesn't use GO, but it has multiple statements.
  // mssql driver can execute multiple statements in one call.
  
  try {
    await query(sqlContent)
    console.log('[db] Database initialized successfully')
  } catch (err) {
    console.error('[db] Failed to initialize database:', err)
    throw err
  }
}
