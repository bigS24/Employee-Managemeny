import { query, queryOne } from './mssql-connection'

export { query, queryOne }

// Deprecated default export
export default function getDb() {
  throw new Error('getDb() is deprecated. Use query() or queryOne() from mssql-connection instead.')
}

export function getDbPath() {
  return 'MSSQL Server'
}
