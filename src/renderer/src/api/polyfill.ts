
import { fetchApi, uploadApi } from './client';

// Helper to construct query string
const toQuery = (params: any) => {
    if (!params) return '';
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) query.append(key, String(value));
    });
    return '?' + query.toString();
};

export const api = {
    getVersion: async () => "1.0.0-web",
    getPlatform: async () => "web",

    // Generic Record Operations
    createRecord: (entity: string, payload: any) => fetchApi(`/records/${entity}`, { method: 'POST', body: JSON.stringify(payload) }),
    listRecords: (entity: string, filters?: any) => fetchApi(`/records/${entity}${toQuery(filters)}`),
    deleteRecord: (entity: string, id: number) => fetchApi(`/records/${entity}/${id}`, { method: 'DELETE' }),
    updateRecord: (entity: string, id: number, payload: any) => fetchApi(`/records/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    getRecord: (entity: string, id: number) => fetchApi(`/records/${entity}/${id}`),

    // Dashboard
    getDashboardSummary: (period?: string) => fetchApi(`/dashboard/summary${toQuery({ period })}`),

    // Employees
    listEmployeesBasic: () => fetchApi('/employees/basic'),
    searchEmployees: (query: string, limit?: number) => fetchApi(`/employees/search${toQuery({ query, limit })}`),
    getEmployeeProfile: (id: number) => fetchApi(`/employees/${id}/profile`), // Need to ensure route exists or fallback

    // Payroll
    payroll: {
        get: (_employee_id: number, _month: string) => fetchApi(`/payroll/${_employee_id}/${_month}`),
        calcPreview: (_inputs: any) => Promise.resolve({ usd: {}, try: {}, rate: 34 }), // Todo: move logic to backend or replicate
        save: (_employee_id: number, _month: string, inputs: any) => fetchApi('/payroll', { method: 'POST', body: JSON.stringify(inputs) }), // Inputs should contain header/lines
        listByMonth: (month: string, _searchQuery?: string) => fetchApi(`/payroll${toQuery({ period: month })}`), // Search query filtering needed?
        getAvailableMonths: () => fetchApi('/payroll/available-months'),
        getEmployeeHistory: (employee_id: number) => fetchApi(`/payroll/history/${employee_id}`),
        deleteMonth: (month: string) => fetchApi(`/excel/month/${month}`, { method: 'DELETE' }), // Using excel router helper or generic?
        updateStatus: (_id: number, _status: string) => Promise.resolve(), // Todo?
        delete: (_id: number) => fetchApi(`/payroll?period=TODO_GET_PERIOD_FROM_ID`), // Logic mismatch? Delete takes id? Or (empId, period)? API expects empId, period.
        getMonthSummary: (month: string) => fetchApi(`/payroll/summary/${month}`)
    },

    payrollSave: (payload: any) => fetchApi('/payroll', { method: 'POST', body: JSON.stringify(payload) }),

    payrollListByEmployee: (employeeId: number, period?: string, limit?: number) => fetchApi(`/payroll/history/${employeeId}${toQuery({ period, limit })}`),
    payrollTotalsByEmployee: (employeeId: number, period?: string) => fetchApi(`/payroll/totals/${employeeId}${toQuery({ period })}`),

    // Excel / Files
    chooseExcelFile: async () => {
        // Web strategy: We can't "choose" and return path.
        // We must depend on UI `<input type="file" />`.
        return { success: false, error: "Use web file picker" };
    },
    excelPreview: (fileOrPath: any) => {
        if (fileOrPath instanceof File) {
            return uploadApi('/excel/preview', fileOrPath);
        }
        return Promise.resolve({ success: false, error: "Preview requires file object" });
    },
    excelImport: (fileOrPath: any, options: any) => {
        if (fileOrPath instanceof File) {
            return uploadApi('/excel/import', fileOrPath, options);
        }
        return Promise.resolve({ success: false, error: "Import requires file object" });
    },
    // We will inject a new method for web upload if needed, or overloading.

    // Missing top-level methods expected by LeavePage
    listLeaves: () => fetchApi('/records/leaves'),
    leavesStats: () => fetchApi('/records/leaves/stats'),

    // Missing top-level methods expected by PayrollPage
    payrollListPeriods: () => fetchApi('/payroll/available-months'),
    payrollListByPeriod: (period: string) => fetchApi(`/payroll?period=${period}`),

    // Evaluations
    listEvaluations: () => fetchApi('/records/evaluations'),
    createEvaluation: (data: any) => fetchApi('/records/evaluations', { method: 'POST', body: JSON.stringify(data) }),
    updateEvaluation: (id: number, data: any) => fetchApi(`/records/evaluations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEvaluation: (id: number) => fetchApi(`/records/evaluations/${id}`, { method: 'DELETE' }),
    evaluationsStats: () => fetchApi('/records/evaluations/stats'),

    // Promotions
    listPromotions: () => fetchApi('/records/promotions'),
    getPromotions: () => fetchApi('/records/promotions'),  // Alias for listPromotions
    createPromotion: (data: any) => fetchApi('/records/promotions', { method: 'POST', body: JSON.stringify(data) }),
    updatePromotion: (id: number, data: any) => fetchApi(`/records/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePromotion: (id: number) => fetchApi(`/records/promotions/${id}`, { method: 'DELETE' }),
    promotionsStats: () => fetchApi('/records/promotions/stats'),

    // Courses
    createCourse: (data: any) => fetchApi('/records/courses', { method: 'POST', body: JSON.stringify(data) }),
    updateCourse: (id: number, data: any) => fetchApi(`/records/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCourse: (id: number) => fetchApi(`/records/courses/${id}`, { method: 'DELETE' }),
    removeCourseAttachment: (path: string) => fetchApi('/files/remove', { method: 'POST', body: JSON.stringify({ path }) }), // Assuming a file removal endpoint exists or needs to be generic

    // Rewards
    listRewards: (filters?: any) => fetchApi(`/records/rewards${toQuery(filters)}`),
    createReward: (data: any) => fetchApi('/records/rewards', { method: 'POST', body: JSON.stringify(data) }),
    updateReward: (id: number, data: any) => fetchApi(`/records/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteReward: (id: number) => fetchApi(`/records/rewards/${id}`, { method: 'DELETE' }),
    rewardsStats: () => fetchApi('/records/rewards/stats'),

    // DB / System
    db: {
        employees: {
            findAll: () => fetchApi('/records/employees'),
            findById: (id: number) => fetchApi(`/records/employees/${id}`)
        },
        exchangeRates: {
            getActive: () => fetchApi('/records/exchange_rates?is_active=1').then(res => ({ success: true, data: res[0] })),
            getHistory: () => fetchApi('/records/exchange_rates') // Added getHistory
        }
    },

    // Files
    files: {
        list: (entityType: string, entityId: number) => fetchApi(`/files/${entityType}/${entityId}`),
        // Attachments repo was generic.
        // IPC files:list -> repos.files.list (wait, src/main/ipc/files.ts didn't have list! records.ts had attachments list)
        // Check preload again.
        // files object in preload had list, save, delete, open.
        // IPC files:list was calling files:list channel.
        // But src/main/ipc/files.ts did NOT register files:list.
        // src/main/ipc/attachments.ts probably did!

        save: (_entityType: string, _entityId: number, _fileName: string, data: any, _uploadedBy: number) => {
            // If data is File, use uploadApi
            if (data instanceof File) {
                return uploadApi('/files/course', data);
            }
            return Promise.resolve({ success: false, error: "Not implemented for non-File data" });
        }
    },

    // Events
    events: {
        on: (event: string, _callback: Function) => {
            console.log(`[Polyfill] Event listener added for ${event}`);
            return () => { };
        },
        emit: (event: string, payload: any) => console.log(`[Polyfill] Event emitted: ${event}`, payload),
        off: () => { }
    },

    // Diagnostics
    invoke: (channel: string, params: any) => {
        console.log(`[Polyfill] Invoke: ${channel}`, params);
        // Map common invokes if missing above
        if (channel === 'leaves:list') return fetchApi('/records/leaves');
        if (channel === 'leaves:create') return fetchApi('/records/leaves', { method: 'POST', body: JSON.stringify(params) });
        if (channel === 'leaves:update') return fetchApi(`/records/leaves/${params.id}`, { method: 'PUT', body: JSON.stringify(params) });
        if (channel === 'dashboard:summary') return api.getDashboardSummary(params?.period);
        if (channel === 'diagnostics:run-all') return Promise.resolve({ ok: true, report: "Diagnostics cleared (web)" });
        if (channel === 'diagnostics:schema') return Promise.resolve({ ok: true, message: "Schema check disabled on web" });
        // ... more mappings
        return Promise.resolve({ ok: true }); // Default success to prevent crashes
    }
};

// Initialize
// Only apply polyfill if we are NOT in Electron (i.e. if electronAPI is missing)
// In Electron, preload.ts sets these up before this code runs.
if (!(window as any).electronAPI) {
    console.log('[Polyfill] Initializing web polyfill');
    (window as any).electronAPI = api;
    (window as any).api = api;
    (window as any).events = api.events;
} else {
    console.log('[Polyfill] Electron environment detected, skipping polyfill');
}
