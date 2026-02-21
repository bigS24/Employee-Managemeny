import { IpcMainInvokeEvent } from 'electron'
import { getDatabase, persistDatabase } from '../../database/init'

function execToObjects(result: any[]): any[] {
    if (result.length === 0) return []
    const columns = result[0].columns
    const values = result[0].values
    return values.map(row => {
        const obj: any = {}
        columns.forEach((col, idx) => {
            obj[col] = row[idx]
        })
        return obj
    })
}

export const absencesHandlers = {
    list: async (event: IpcMainInvokeEvent, filters?: any) => {
        const db = getDatabase()
        try {
            let query = `
                SELECT a.*, e.full_name as employee_name 
                FROM absences a
                LEFT JOIN employees e ON a.employee_id = e.id
                ORDER BY a.from_date DESC
            `
            const result = db.exec(query)
            return execToObjects(result)
        } catch (error) {
            console.error('Error listing absences:', error)
            throw error
        }
    },

    create: async (event: IpcMainInvokeEvent, data: any) => {
        const db = getDatabase()
        try {
            if (!data.employee_id) throw new Error('Employee ID is required')

            const fields = Object.keys(data)
            const placeholders = fields.map(() => '?').join(', ')
            const fieldNames = fields.join(', ')
            const values = fields.map(f => data[f])

            db.run(`
                INSERT INTO absences (${fieldNames}, created_at)
                VALUES (${placeholders}, datetime('now'))
            `, values)

            persistDatabase()
            const idRes = db.exec('SELECT last_insert_rowid() as id')
            return { success: true, id: idRes[0].values[0][0] }
        } catch (error) {
            console.error('Error creating absence:', error)
            throw error
        }
    },

    update: async (event: IpcMainInvokeEvent, id: number, data: any) => {
        const db = getDatabase()
        try {
            const fields = Object.keys(data).filter(k => k !== 'id')
            const setClause = fields.map(f => `${f} = ?`).join(', ')
            const values = fields.map(f => data[f])
            values.push(id)

            db.run(`
                UPDATE absences 
                SET ${setClause}, updated_at = datetime('now')
                WHERE id = ?
            `, values)

            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error updating absence:', error)
            throw error
        }
    },

    delete: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            db.run('DELETE FROM absences WHERE id = ?', [id])
            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error deleting absence:', error)
            throw error
        }
    },

    // Delay hours handlers
    listDelays: async (event: IpcMainInvokeEvent, filters?: any) => {
        const db = getDatabase()
        try {
            let query = `
                SELECT d.*, e.full_name as employee_name 
                FROM delay_records d
                LEFT JOIN employees e ON d.employee_id = e.id
                ORDER BY d.date DESC
            `
            const result = db.exec(query)
            return execToObjects(result)
        } catch (error) {
            console.error('Error listing delays:', error)
            throw error
        }
    },

    createDelay: async (event: IpcMainInvokeEvent, data: any) => {
        const db = getDatabase()
        try {
            if (!data.employee_id) throw new Error('Employee ID is required')

            db.run(`
                INSERT INTO delay_records (employee_id, employee_name, date, delay_hours, delay_minutes, reason, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                data.employee_id,
                data.employee_name,
                data.date,
                data.delay_hours || 0,
                data.delay_minutes || 0,
                data.reason,
                data.notes
            ])

            persistDatabase()
            const idRes = db.exec('SELECT last_insert_rowid() as id')
            return { success: true, id: idRes[0].values[0][0] }
        } catch (error) {
            console.error('Error creating delay:', error)
            throw error
        }
    },

    updateDelay: async (event: IpcMainInvokeEvent, id: number, data: any) => {
        const db = getDatabase()
        try {
            db.run(`
                UPDATE delay_records 
                SET employee_id = ?, employee_name = ?, date = ?, delay_hours = ?, 
                    delay_minutes = ?, reason = ?, notes = ?, updated_at = datetime('now')
                WHERE id = ?
            `, [
                data.employee_id,
                data.employee_name,
                data.date,
                data.delay_hours || 0,
                data.delay_minutes || 0,
                data.reason,
                data.notes,
                id
            ])

            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error updating delay:', error)
            throw error
        }
    },

    deleteDelay: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            db.run('DELETE FROM delay_records WHERE id = ?', [id])
            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error deleting delay:', error)
            throw error
        }
    }
}
