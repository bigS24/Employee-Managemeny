import { query, queryOne } from '../mssql-connection'

export default {
  async findAll(filters?: any) {
    let sql = 'SELECT * FROM departments'
    if (filters?.search) {
      sql += ` WHERE name LIKE '%${filters.search}%'`
    }
    sql += ' ORDER BY name'
    const result = await query(sql)
    return result.recordset
  },

  async findById(id: number) {
    const result = await queryOne('SELECT * FROM departments WHERE id = @id', { id })
    return result
  },

  async create(data: any) {
    const sql = `
      INSERT INTO departments (name, manager_id)
      VALUES (@name, @manager_id);
      SELECT SCOPE_IDENTITY() AS id;
    `
    const result = await queryOne(sql, { 
      name: data.name, 
      manager_id: data.manager_id || null 
    })
    return result.id
  },

  async update(id: number, data: any) {
    const sql = `
      UPDATE departments
      SET name = @name, manager_id = @manager_id
      WHERE id = @id
    `
    await query(sql, { 
      id, 
      name: data.name, 
      manager_id: data.manager_id || null 
    })
    return 1
  },

  async remove(id: number) {
    const sql = 'DELETE FROM departments WHERE id = @id'
    const result = await query(sql, { id })
    return result.rowsAffected[0]
  }
}
