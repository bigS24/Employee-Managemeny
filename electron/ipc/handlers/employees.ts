import { IpcMainInvokeEvent } from 'electron'
import { getDatabase, persistDatabase } from '../../database/init'
import { logCreate, logUpdate, logDelete } from '../../utils/auditLog'

export const employeesHandlers = {
    list: async (event: IpcMainInvokeEvent, filters?: any) => {
        const db = getDatabase()
        try {
            let query = 'SELECT * FROM employees WHERE deleted_at IS NULL'
            const params: any[] = []

            if (filters?.search) {
                query += ' AND (full_name LIKE ? OR employee_no LIKE ?)'
                params.push(`%${filters.search}%`, `%${filters.search}%`)
            }

            if (filters?.department) {
                query += ' AND department = ?'
                params.push(filters.department)
            }

            if (filters?.employment_status) {
                query += ' AND employment_status = ?'
                params.push(filters.employment_status)
            }

            // Correct numeric-like sort for employee_no
            query += ' ORDER BY CAST(employee_no AS INTEGER) ASC, full_name ASC'

            const result = db.exec(query, params)
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
        } catch (error) {
            console.error('Error listing employees:', error)
            throw error
        }
    },

    search: async (event: IpcMainInvokeEvent, query_str: string) => {
        const db = getDatabase()
        try {
            const sql = `
                SELECT id, full_name as name, employee_no
                FROM employees 
                WHERE deleted_at IS NULL 
                AND (full_name LIKE ? OR employee_no LIKE ?)
                ORDER BY CAST(employee_no AS INTEGER) ASC
                LIMIT 20
            `
            const result = db.exec(sql, [`%${query_str}%`, `%${query_str}%`])
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
        } catch (error) {
            console.error('Error searching employees:', error)
            return []
        }
    },

    // ... (get, create, update, delete same)

    profile: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            // 1. Get Employee
            const empResult = db.exec('SELECT * FROM employees WHERE id = ?', [id])
            if (empResult.length === 0 || empResult[0].values.length === 0) {
                throw new Error('Employee not found')
            }
            const empCols = empResult[0].columns
            const empRow = empResult[0].values[0]
            const employee: any = {}
            empCols.forEach((col, idx) => {
                employee[col] = empRow[idx]
            })
            // Normalize dates/status
            employee.hire_date = employee.join_date || employee.hire_date
            employee.status = employee.employment_status || employee.status

            // 2. Helper for counts
            const getCount = (table: string) => {
                try {
                    const res = db.exec(`SELECT COUNT(*) FROM ${table} WHERE employee_id = ?`, [id])
                    return res[0].values[0][0] as number
                } catch (e) { return 0 }
            }

            // 3. Helper for recent
            const getRecent = (table: string) => {
                try {
                    const res = db.exec(`SELECT * FROM ${table} WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5`, [id])
                    if (res.length === 0) return []
                    const cols = res[0].columns
                    return res[0].values.map(r => {
                        const o: any = {}
                        cols.forEach((c, i) => o[c] = r[i])
                        return o
                    })
                } catch (e) { return [] }
            }

            // Execute counts
            const counts = {
                courses: getCount('course_enrollments'),
                evaluations: getCount('evaluations'),
                promotions: getCount('promotions'),
                rewards: getCount('rewards'),
                leaves: getCount('leaves'),
                absences: getCount('absences')
            }

            // Execute recent
            const recent = {
                courses: [],
                evaluations: getRecent('evaluations'),
                promotions: getRecent('promotions'),
                rewards: getRecent('rewards'),
                leaves: getRecent('leaves'),
                absences: getRecent('absences')
            }

            // Courses join
            try {
                const coursesRes = db.exec(`
                    SELECT ce.*, c.title as course_name, c.instructor as provider, 
                           c.start_date, c.end_date, ce.completion_status as status
                    FROM course_enrollments ce
                    LEFT JOIN courses c ON ce.course_id = c.id
                    WHERE ce.employee_id = ?
                    ORDER BY ce.enrollment_date DESC LIMIT 5
                `, [id])
                if (coursesRes.length > 0) {
                    const cols = coursesRes[0].columns
                    recent.courses = coursesRes[0].values.map(r => {
                        const o: any = {}
                        cols.forEach((c, i) => o[c] = r[i])
                        return o
                    })
                }
            } catch (e) { console.error('Error fetching courses profile:', e) }

            return {
                success: true,
                data: {
                    employee,
                    counts,
                    recent
                }
            }

        } catch (error) {
            console.error('Error getting employee profile:', error)
            throw error
        }
    },

    getSalaryDefaults: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            const res = db.exec('SELECT basic_salary, housing_allowance, transport_allowance, other_allowances, grade FROM employees WHERE id = ?', [id])
            if (res.length === 0 || res[0].values.length === 0) return null
            const columns = res[0].columns
            const values = res[0].values[0]
            const emp: any = {}
            columns.forEach((col, idx) => emp[col] = values[idx])

            return {
                base_salary: emp.basic_salary || 0,
                housing_allowance: emp.housing_allowance || 0,
                transport_allowance: emp.transport_allowance || 0,
                other_allowances: emp.other_allowances || 0,
                grade: emp.grade
            }
        } catch (error) {
            console.error('Error getting salary defaults:', error)
            throw error
        }
    },

    get: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            const result = db.exec('SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL', [id])
            if (result.length === 0) return null

            const columns = result[0].columns
            const row = result[0].values[0]

            const obj: any = {}
            columns.forEach((col, idx) => {
                obj[col] = row[idx]
            })
            return obj
        } catch (error) {
            console.error('Error getting employee:', error)
            throw error
        }
    },

    create: async (event: IpcMainInvokeEvent, data: any) => {
        const db = getDatabase()
        try {
            const fields = Object.keys(data)
            const placeholders = fields.map(() => '?').join(', ')
            const fieldNames = fields.join(', ')
            const values = fields.map(f => data[f])

            db.run(`
        INSERT INTO employees (${fieldNames})
        VALUES (${placeholders})
      `, values)

            persistDatabase()

            // Get the last inserted ID
            const result = db.exec('SELECT last_insert_rowid() as id')
            const id = result[0].values[0][0]

            // Log audit
            logCreate('employee', id as number, data.full_name || data.employee_no || 'موظف جديد', data)

            return { id, ...data }
        } catch (error) {
            console.error('Error creating employee:', error)
            throw error
        }
    },

    update: async (event: IpcMainInvokeEvent, id: number, data: any) => {
        const db = getDatabase()
        try {
            // Get old data for audit log
            const oldResult = db.exec('SELECT * FROM employees WHERE id = ?', [id])
            let oldData: any = null
            if (oldResult.length > 0 && oldResult[0].values.length > 0) {
                const cols = oldResult[0].columns
                const row = oldResult[0].values[0]
                oldData = {}
                cols.forEach((col, idx) => oldData[col] = row[idx])
            }

            const fields = Object.keys(data).filter(key => key !== 'id')
            const setClause = fields.map(field => `${field} = ?`).join(', ')
            const values = fields.map(f => data[f])
            values.push(id)

            db.run(`
        UPDATE employees 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `, values)

            persistDatabase()

            // Log audit
            logUpdate('employee', id, data.full_name || oldData?.full_name || 'موظف', oldData, data)

            return { id, ...data }
        } catch (error) {
            console.error('Error updating employee:', error)
            throw error
        }
    },

    delete: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            // Get employee name for audit log
            const empResult = db.exec(`SELECT full_name FROM employees WHERE id = ${id}`)
            const empName = empResult.length > 0 && empResult[0].values.length > 0
                ? empResult[0].values[0][0] as string
                : 'موظف'

            // Soft delete
            db.run(`
        UPDATE employees 
        SET deleted_at = datetime('now')
        WHERE id = ${id}
      `)

            persistDatabase()

            // Log audit
            logDelete('employee', id, empName)

            return { success: true }
        } catch (error) {
            console.error('Error deleting employee:', error)
            throw error
        }
    },

    export: async (event: IpcMainInvokeEvent, filters?: any) => {
        const { dialog, app } = require('electron')
        const ExcelJS = require('exceljs')
        const path = require('path')
        const fs = require('fs')

        const db = getDatabase()
        try {
            // Build query with filters
            let query = 'SELECT * FROM employees WHERE deleted_at IS NULL'
            const params: any[] = []

            if (filters?.search) {
                query += ' AND (full_name LIKE ? OR employee_no LIKE ?)'
                params.push(`%${filters.search}%`, `%${filters.search}%`)
            }

            if (filters?.department) {
                query += ' AND department = ?'
                params.push(filters.department)
            }

            if (filters?.employment_status) {
                query += ' AND employment_status = ?'
                params.push(filters.employment_status)
            }

            query += ' ORDER BY CAST(employee_no AS INTEGER) ASC'

            const result = db.exec(query, params)
            if (result.length === 0) {
                return { success: false, error: 'لا توجد بيانات للتصدير' }
            }

            const columns = result[0].columns
            const values = result[0].values
            const employees = values.map((row: any) => {
                const obj: any = {}
                columns.forEach((col, idx) => {
                    obj[col] = row[idx]
                })
                return obj
            })

            // Show save dialog
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'حفظ ملف الموظفين',
                defaultPath: `employees_${new Date().toISOString().split('T')[0]}.xlsx`,
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx'] },
                    { name: 'CSV Files', extensions: ['csv'] }
                ]
            })

            if (canceled || !filePath) {
                return { success: false, canceled: true }
            }

            // Create Excel workbook
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('الموظفون')

            // Define columns
            worksheet.columns = [
                { header: 'رقم الموظف', key: 'employee_no', width: 15 },
                { header: 'الاسم الكامل', key: 'full_name', width: 30 },
                { header: 'القسم', key: 'department', width: 20 },
                { header: 'الوحدة', key: 'unit', width: 20 },
                { header: 'المسمى الوظيفي', key: 'job_title', width: 25 },
                { header: 'المؤهل العلمي', key: 'education_degree', width: 20 },
                { header: 'الهاتف', key: 'phone', width: 15 },
                { header: 'البريد الإلكتروني', key: 'email', width: 25 },
                { header: 'تاريخ التعيين', key: 'join_date', width: 15 },
                { header: 'الراتب الأساسي', key: 'basic_salary', width: 15 },
                { header: 'الحالة', key: 'employment_status', width: 15 }
            ]

            // Add rows
            employees.forEach((emp: any) => {
                worksheet.addRow(emp)
            })

            // Style header
            worksheet.getRow(1).font = { bold: true }
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            }

            // Save file
            await workbook.xlsx.writeFile(filePath)

            return { success: true, filePath, count: employees.length }
        } catch (error: any) {
            console.error('Export error:', error)
            return { success: false, error: error.message }
        }
    }
}
