"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePeriod = normalizePeriod;
exports.getCurrentPeriod = getCurrentPeriod;
exports.formatPeriodForDisplay = formatPeriodForDisplay;
function normalizePeriod(input) {
    // Accept "YYYY-MM", "YYYY/MM", "MM-YYYY", "MM/YYYY"
    const s = String(input).trim();
    const m1 = s.match(/^(\d{4})[-/](\d{2})$/); // YYYY-MM
    if (m1)
        return `${m1[1]}-${m1[2]}`;
    const m2 = s.match(/^(\d{2})[-/](\d{4})$/); // MM-YYYY
    if (m2)
        return `${m2[2]}-${m2[1]}`;
    // fallback: try Date
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }
    // ultimate fallback: return input unchanged
    return s;
}
function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function formatPeriodForDisplay(period) {
    const normalized = normalizePeriod(period);
    const [year, month] = normalized.split('-');
    return `${month}-${year}`;
}
