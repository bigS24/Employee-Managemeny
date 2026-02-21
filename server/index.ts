
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/mssql-init';
import { seedIfEmpty } from './db/seed';

dotenv.config();

import recordsRouter from './routes/records';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import employeesRouter from './routes/employees';

import payrollRouter from './routes/payroll';

import dashboardRouter from './routes/dashboard';

import filesRouter from './routes/files';
import excelRouter from './routes/excel';

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/records', recordsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/files', filesRouter);
app.use('/api/excel', excelRouter);

// Error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('[ERROR]', err.message);
    if (err.stack) console.error('[ERROR] Stack:', err.stack);
    res.status(500).send(err.stack || err.message);
});

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Initialize Database and Start Server
async function startServer() {
    try {
        await initializeDatabase();
        await seedIfEmpty();
        console.log('✅ Database connected and initialized');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Error handler middleware
// Force restart for route updates
