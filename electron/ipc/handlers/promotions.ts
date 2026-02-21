import { IpcMainInvokeEvent } from 'electron'
import { getDatabase, persistDatabase } from '../../database/init'
import { logCreate, logDelete } from '../../utils/auditLog'

export const promotionsHandlers = {
    create: async (event: IpcMainInvokeEvent, data: any) => {
        const db = getDatabase()
        try {
            // Validation
            if (!data.employee_id) throw new Error('Employee ID is required')

            const employeeId = data.employee_id
            const employeeName = data.employee_name ? `'${data.employee_name.replace(/'/g, "''")}'` : 'NULL'
            const fromTitle = data.from_title ? `'${data.from_title.replace(/'/g, "''")}'` : 'NULL'
            const toTitle = data.to_title ? `'${data.to_title.replace(/'/g, "''")}'` : 'NULL'
            const fromGrade = data.from_grade ? `'${String(data.from_grade).replace(/'/g, "''")}'` : 'NULL'
            const toGrade = data.to_grade ? `'${String(data.to_grade).replace(/'/g, "''")}'` : 'NULL'
            const promoType = data.promo_type ? `'${data.promo_type}'` : "'regular'"
            const status = data.status ? `'${data.status}'` : "'pending'"
            const effectiveDate = data.effective_date ? `'${data.effective_date}'` : `'${new Date().toISOString().split('T')[0]}'`
            const increaseAmountUsd = data.increase_amount_usd || 0
            const increasePercent = data.increase_percent || 0
            const notes = data.notes ? `'${data.notes.replace(/'/g, "''")}'` : 'NULL'

            db.run(`
                INSERT INTO promotions (
                    employee_id, employee_name, from_title, to_title,
                    from_grade, to_grade, promo_type, status, effective_date,
                    increase_amount_usd, increase_percent, notes, created_at
                ) VALUES (${employeeId}, ${employeeName}, ${fromTitle}, ${toTitle}, ${fromGrade}, ${toGrade}, ${promoType}, ${status}, ${effectiveDate}, ${increaseAmountUsd}, ${increasePercent}, ${notes}, datetime('now'))
            `)

            // If promotion includes a raise and is approved, update employee's base salary
            if ((status === "'approved'" || status === "'effective'") && increaseAmountUsd > 0) {
                // Update employee's base salary
                db.run(`
                    UPDATE employees
                    SET base_salary_usd = COALESCE(base_salary_usd, 0) + ${increaseAmountUsd},
                        updated_at = datetime('now')
                    WHERE id = ${employeeId}
                `)

                // Also update job title and grade if provided
                const updates: string[] = []
                if (data.to_title) {
                    updates.push(`job_title = '${String(data.to_title).replace(/'/g, "''")}'`)
                }
                if (data.to_grade) {
                    updates.push(`grade = '${String(data.to_grade).replace(/'/g, "''")}'`)
                }
                if (updates.length > 0) {
                    db.run(`
                        UPDATE employees
                        SET ${updates.join(', ')}, updated_at = datetime('now')
                        WHERE id = ${employeeId}
                    `)
                }
            }

            persistDatabase()
            const promoIdRes = db.exec('SELECT last_insert_rowid() as id')
            const promoId = promoIdRes[0].values[0][0]

            // Log audit
            const empResult = db.exec(`SELECT full_name FROM employees WHERE id = ${data.employee_id}`)
            const empName = empResult.length > 0 && empResult[0].values.length > 0
                ? empResult[0].values[0][0] as string
                : 'موظف'
            logCreate('promotion', promoId as number, `ترقية ${empName}`, data)

            return { success: true, id: promoId }
        } catch (error) {
            console.error('Error creating promotion:', error)
            throw error
        }
    },

    list: async (event: IpcMainInvokeEvent) => {
        const db = getDatabase()
        const res = db.exec("SELECT * FROM promotions ORDER BY created_at DESC")
        if (res.length > 0) {
            const cols = res[0].columns
            return res[0].values.map(row => {
                const obj: any = {}
                cols.forEach((c, i) => obj[c] = row[i])
                return obj
            })
        }
        return []
    },

    /**
     * Sync promotion to payroll - updates employee's payroll when promotion is approved
     */
    syncToPayroll: async (event: IpcMainInvokeEvent, promotionId: number) => {
        const db = getDatabase()

        try {
            // Get promotion details
            const promoResult = db.exec(`SELECT * FROM promotions WHERE id = ${promotionId}`)
            if (promoResult.length === 0 || promoResult[0].values.length === 0) {
                throw new Error('Promotion not found')
            }

            const cols = promoResult[0].columns
            const promotion: any = {}
            cols.forEach((c, i) => promotion[c] = promoResult[0].values[0][i])

            // Only sync if promotion is approved/effective
            if (promotion.status !== 'approved' && promotion.status !== 'effective') {
                return { success: false, message: 'Promotion must be approved to sync to payroll' }
            }

            // Get employee's current payroll for the period
            const effectiveDate = new Date(promotion.effective_date)
            const period = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`

            const payrollResult = db.exec(
                `SELECT * FROM payroll_headers WHERE employee_id = ${promotion.employee_id} AND period = '${period}'`
            )

            if (payrollResult.length > 0 && payrollResult[0].values.length > 0) {
                // Update existing payroll
                const updates: string[] = []

                if (promotion.to_title) {
                    updates.push(`job_title = '${promotion.to_title.replace(/'/g, "''")}'`)
                }

                if (promotion.increase_amount_usd && promotion.increase_amount_usd > 0) {
                    // Add increase to base salary
                    updates.push(`base_min = base_min + ${promotion.increase_amount_usd}`)
                }

                if (updates.length > 0) {
                    db.run(`
                        UPDATE payroll_headers
                        SET ${updates.join(', ')}, updated_at = datetime('now')
                        WHERE employee_id = ${promotion.employee_id} AND period = '${period}'
                    `)
                }
            }

            // Also update employee record
            const empUpdates: string[] = []

            if (promotion.to_title) {
                empUpdates.push(`job_title = '${promotion.to_title.replace(/'/g, "''")}'`)
            }

            if (promotion.to_grade) {
                empUpdates.push(`grade = '${promotion.to_grade.replace(/'/g, "''")}'`)
            }

            if (promotion.increase_amount_usd && promotion.increase_amount_usd > 0) {
                empUpdates.push(`base_salary_usd = COALESCE(base_salary_usd, 0) + ${promotion.increase_amount_usd}`)
            }

            if (empUpdates.length > 0) {
                db.run(`
                    UPDATE employees
                    SET ${empUpdates.join(', ')}, updated_at = datetime('now')
                    WHERE id = ${promotion.employee_id}
                `)
            }

            persistDatabase()

            return {
                success: true,
                message: 'Promotion synced to payroll and employee record successfully'
            }
        } catch (error) {
            console.error('Error syncing promotion to payroll:', error)
            throw error
        }
    }
}
