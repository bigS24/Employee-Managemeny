import { IpcMainInvokeEvent } from 'electron'
import { getDatabase, persistDatabase } from '../../database/init'

export const exchangeRatesHandlers = {
    getHistory: async () => {
        const db = getDatabase()
        try {
            // Get recent 50 rates ordered by effective_date desc
            const result = db.exec(`
        SELECT * FROM exchange_rates 
        ORDER BY effective_date DESC, created_at DESC 
        LIMIT 50
      `)

            if (result.length === 0) return []

            const columns = result[0].columns
            const values = result[0].values

            return values.map(row => {
                const obj: any = {}
                columns.forEach((col, idx) => {
                    obj[col] = row[idx]
                })
                // Map effective_date to effective_from for frontend compatibility
                obj.effective_from = obj.effective_date
                obj.is_active = obj.is_active === 1
                return obj
            })
        } catch (error) {
            console.error('Error fetching exchange rates:', error)
            throw error
        }
    },

    create: async (_event: IpcMainInvokeEvent, data: any) => {
        const db = getDatabase()
        try {
            // Start transaction-like behavior (SQLite is serial in this setup)

            // If new rate is active, deactivate all others
            if (data.is_active) {
                db.run(`UPDATE exchange_rates SET is_active = 0 WHERE is_active = 1`)
            }

            const effectiveDate = data.effective_from || data.effective_date || new Date().toISOString().split('T')[0]
            const rate = data.rate
            const note = data.note ? `'${data.note.replace(/'/g, "''")}'` : 'NULL'

            db.run(`
                INSERT INTO exchange_rates (
                    currency_from, currency_to, rate, effective_date, created_at
                ) VALUES ('USD', 'TRY', ${rate}, '${effectiveDate}', datetime('now'))
            `)

            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error creating exchange rate:', error)
            throw error
        }
    },

    activate: async (_event: IpcMainInvokeEvent, id: number) => {
        const db = getDatabase()
        try {
            // Deactivate all
            db.run(`UPDATE exchange_rates SET is_active = 0`)

            // Activate target
            db.run(`UPDATE exchange_rates SET is_active = 1 WHERE id = ${id}`)

            persistDatabase()
            return { success: true }
        } catch (error) {
            console.error('Error activating exchange rate:', error)
            throw error
        }
    },

    getActive: async () => {
        const db = getDatabase()
        try {
            const result = db.exec(`
        SELECT * FROM exchange_rates 
        WHERE is_active = 1 
        LIMIT 1
      `)

            if (result.length === 0 || result[0].values.length === 0) {
                return null
            }

            const columns = result[0].columns
            const row = result[0].values[0]
            const obj: any = {}
            columns.forEach((col, idx) => {
                obj[col] = row[idx]
            })
            // Map effective_date to effective_from for frontend compatibility
            obj.effective_from = obj.effective_date
            obj.is_active = obj.is_active === 1
            return obj
        } catch (error) {
            console.error('Error fetching active exchange rate:', error)
            throw error
        }
    },

    getConversionPreview: async (_event: IpcMainInvokeEvent, amount: number, fromCurrency?: string, toCurrency?: string) => {
        const db = getDatabase()
        try {
            // Get active rate
            const result = db.exec(`
        SELECT * FROM exchange_rates 
        WHERE is_active = 1 
        LIMIT 1
      `)

            if (result.length === 0 || result[0].values.length === 0) {
                return {
                    success: false,
                    error: 'لا يوجد سعر صرف نشط'
                }
            }

            const columns = result[0].columns
            const row = result[0].values[0]
            const activeRate: any = {}
            columns.forEach((col, idx) => {
                activeRate[col] = row[idx]
            })

            const rate = parseFloat(activeRate.rate)
            const from = fromCurrency || activeRate.currency_from
            const to = toCurrency || activeRate.currency_to

            // Calculate conversion
            const convertedAmount = amount * rate

            return {
                success: true,
                amount,
                convertedAmount,
                rate,
                fromCurrency: from,
                toCurrency: to,
                effectiveFrom: activeRate.effective_date
            }
        } catch (error) {
            console.error('Error calculating conversion:', error)
            return {
                success: false,
                error: 'فشل حساب التحويل'
            }
        }
    }
}
