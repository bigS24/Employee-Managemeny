import { IpcMainInvokeEvent } from 'electron'
import { getDatabase, persistDatabase } from '../../database/init'
import { logCreate, logUpdate, logDelete } from '../../utils/auditLog'

export const coursesHandlers = {
    list: async (event: IpcMainInvokeEvent) => {
        const db = getDatabase()
        try {
            // Join courses, enrollments, and employees
            // Return mapped columns: course_name (title), provider (instructor), etc.
            const result = db.exec(`
                SELECT 
                    c.id, 
                    c.title as course_name, 
                    c.instructor as provider,
                    c.start_date,
                    c.end_date,
                    c.status,
                    c.attachment_path,
                    e.full_name as employee_name,
                    ce.employee_id,
                    ce.grade,
                    ce.result,
                    ce.score
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                LEFT JOIN employees e ON ce.employee_id = e.id
                ORDER BY c.created_at DESC
            `)

            if (result.length > 0 && result[0].values) {
                const columns = result[0].columns
                return result[0].values.map(row => {
                    const obj: any = {}
                    columns.forEach((col, i) => {
                        obj[col] = row[i]
                    })
                    return obj
                })
            }
            return []
        } catch (error) {
            console.error('Error listing courses:', error)
            return []
        }
    },

    create: async (data: any) => {
        const db = getDatabase()
        try {
            console.log('[Courses Create] Received data:', JSON.stringify(data, null, 2))

            db.exec('BEGIN TRANSACTION')

            const courseName = data.course_name ? `'${data.course_name.replace(/'/g, "''")}'` : "'Untitled Course'"
            const provider = data.provider ? `'${data.provider.replace(/'/g, "''")}'` : "''"
            const startDate = data.start_date ? `'${data.start_date}'` : 'NULL'
            const endDate = data.end_date ? `'${data.end_date}'` : 'NULL'
            const status = data.status ? `'${data.status}'` : "'planned'"

            console.log('[Courses Create] Prepared values:', { courseName, provider, startDate, endDate, status })

            // 1. Insert Course with default values for undefined fields
            db.run(`
                INSERT INTO courses (title, instructor, start_date, end_date, status, created_at)
                VALUES (${courseName}, ${provider}, ${startDate}, ${endDate}, ${status}, datetime('now'))
            `)

            const courseRes = db.exec('SELECT last_insert_rowid() as id')
            const courseId = courseRes[0].values[0][0]

            console.log('[Courses Create] Created course with ID:', courseId)

            // 2. Insert Enrollment if employee selected
            if (data.employee_id) {
                const enrollmentStatus = data.status ? `'${data.status}'` : "'enrolled'"
                const grade = data.grade ? `'${data.grade}'` : 'NULL'
                const result = data.result ? `'${data.result.replace(/'/g, "''")}'` : 'NULL'

                console.log('[Courses Create] Creating enrollment:', { employee_id: data.employee_id, grade, result })

                db.run(`
                    INSERT INTO course_enrollments (
                        course_id, employee_id, enrollment_date, 
                        completion_status, grade, result
                    ) VALUES (${courseId}, ${data.employee_id}, datetime('now'), ${enrollmentStatus}, ${grade}, ${result})
                `)
            }

            db.exec('COMMIT')
            persistDatabase()

            // Log audit
            logCreate('course', courseId as number, data.course_name || 'دورة جديدة', data)

            console.log('[Courses Create] Success!')
            return { success: true, id: courseId }
        } catch (error) {
            db.exec('ROLLBACK')
            console.error('Error creating course:', error)
            throw error
        }
    },

    update: async (event: IpcMainInvokeEvent, id: number, data: any) => {
        const db = getDatabase()
        try {
            const courseName = data.course_name ? `'${data.course_name.replace(/'/g, "''")}` : 'NULL'
            const provider = data.provider ? `'${data.provider.replace(/'/g, "''")}'` : 'NULL'
            const startDate = data.start_date ? `'${data.start_date}'` : 'NULL'
            const endDate = data.end_date ? `'${data.end_date}'` : 'NULL'
            const status = data.status ? `'${data.status}'` : 'NULL'

            db.run(`
                UPDATE courses SET 
                    title = ${courseName}, instructor = ${provider}, start_date = ${startDate}, end_date = ${endDate}, status = ${status}, updated_at = datetime('now')
                WHERE id = ${id}
            `)

            // Update enrollment if present
            if (data.employee_id || data.grade || data.result) {
                const employeeId = data.employee_id || 'employee_id'
                const grade = data.grade || 'NULL'
                const result = data.result ? `'${data.result.replace(/'/g, "''")}'` : 'NULL'

                db.run(`
                    UPDATE course_enrollments SET
                        employee_id = COALESCE(${data.employee_id}, employee_id),
                        grade = ${grade},
                        result = ${result}
                    WHERE course_id = ${id}
                 `)
            }

            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error updating course:', error)
            throw error
        }
    },

    delete: async (event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            // Get course name for audit
            const courseResult = db.exec(`SELECT title FROM courses WHERE id = ${id}`)
            const courseName = courseResult.length > 0 && courseResult[0].values.length > 0
                ? courseResult[0].values[0][0] as string
                : 'دورة'

            db.run(`DELETE FROM courses WHERE id = ${id}`)
            // Cascade delete handles enrollments
            persistDatabase()

            // Log audit
            logDelete('course', id, courseName)

            return { success: true }
        } catch (error) {
            console.error('Error deleting course:', error)
            throw error
        }
    }
}
