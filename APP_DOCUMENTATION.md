# Employee Management Application

## Overview
The Employee Management Application is a comprehensive Human Resources (HR) system designed to streamline the management of employee data, payroll processing, leaves, performance evaluations, and more. It is built as a desktop application using Electron, React, and Microsoft SQL Server, offering a robust and secure solution for HR departments.

The application is designed with **Right-to-Left (RTL)** support, making it optimized for Arabic-speaking users.

## Key Features

### 👥 Employee Management
*   **Centralized Database**: Store and manage detailed employee records (personal info, job details, contact info).
*   **Employee Profiles**: Dedicated profile views for each employee showing their history, documents, and status.
*   **Document Management**: Attach and manage files related to employees (contracts, IDs, etc.).

### 💰 Payroll & Compensation
*   **Automated Payroll**: Calculate salaries based on base pay, allowances, and deductions.
*   **Multi-Currency Support**: Handle salaries in **USD** and **TRY**, with real-time exchange rate handling.
*   **Payslip Generation**: Generate and export detailed payslips.
*   **Loan Management**: Track employee loans and manage installment deductions.
*   **Rewards & Penalties**: Record financial rewards or penalties that automatically impact payroll.

### 📅 Time & Attendance
*   **Leave Management**: Track various types of leaves (Annual, Sick, Unpaid, etc.) with approval workflows.
*   **Absence Tracking**: Record unauthorized absences and automatically calculate fines.
*   **Overtime**: Log overtime hours and calculate payments based on configurable rates.
*   **Holidays**: Manage public holidays and work schedules.

### 📈 Performance & Development
*   **Evaluations**: Conduct periodic performance reviews with scoring and goals.
*   **Promotions**: Track career progression, grade changes, and salary adjustments.
*   **Training & Courses**: Record training programs attended by employees and their results.

### 📊 Reporting & Settings
*   **Dashboard**: Visual overview of key HR metrics (Headcount, Payroll costs, etc.).
*   **Reports**: Generate detailed reports for analysis.
*   **Exchange Rates**: Manage daily/monthly currency exchange rates for accurate payroll conversion.

---

## Application Pages

| Page | Description |
| :--- | :--- |
| **Dashboard** | Provides a high-level summary of the organization's status, including active employees, upcoming leaves, and quick stats. |
| **Employees** | The main directory of all employees. Allows adding, editing, and archiving employee records. Clicking an employee opens their **Profile**. |
| **Payroll** | The core payroll processing engine. Allows HR to generate monthly payrolls, review calculations, and finalize salary sheets. |
| **Leaves** | A calendar and list view of employee leave requests. |
| **Absences** | Logs of employee absences. Used to calculate deductions for the payroll. |
| **Evaluations** | Management of performance reviews and appraisal cycles. |
| **Promotions** | History of employee promotions and title changes. |
| **Rewards** | Management of bonuses and financial rewards. |
| **Courses** | Tracking of employee training and professional development. |
| **Service Years** | Reports on employee tenure and seniority. |
| **Exchange Rates** | Configuration page for setting USD/TRY exchange rates used in financial calculations. |

---

## Technical Architecture

The application follows a modern **Electron** architecture with a clear separation of concerns:

### 1. Frontend (Renderer Process)
*   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/).
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive design.
*   **UI Library**: [Shadcn UI](https://ui.shadcn.com/) for accessible and consistent components.
*   **State Management**: React Context / Hooks.
*   **Routing**: React Router DOM.

### 2. Backend (Main Process)
*   **Framework**: [Electron](https://www.electronjs.org/).
*   **Communication**: IPC (Inter-Process Communication) is used to securely connect the Frontend and Backend.
*   **Data Access**: The "Repository Pattern" is used to abstract database operations.

### 3. Database
*   **System**: [Microsoft SQL Server](https://www.microsoft.com/sql-server) (MSSQL).
*   **Connection**: `mssql` (Node.js client) with connection pooling.
*   **Schema**: Relational schema with normalized tables for integrity.

---

## Database Schema

The database (`EmployeeManagement`) consists of the following key tables:

*   `employees`: Core employee data.
*   `payroll_snapshots`: Monthly payroll records (freezes calculations for history).
*   `payroll_headers` / `payroll_lines`: Detailed breakdown of salary components.
*   `leaves` / `absences`: Time-off records.
*   `loans`: Employee loan tracking.
*   `evaluations` / `promotions` / `rewards` / `penalties` / `courses`: Employee history tables.
*   `exchange_rates`: Currency conversion rates.
*   `users`: System users and authentication (if enabled).

---

## Installation & Setup

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Microsoft SQL Server** (2019 or higher) - Express or Developer edition.

### Configuration
The application uses a `.env` file for configuration. Ensure the following variables are set:

```env
# SQL Server Configuration
DB_USER=sa               # SQL Server Username
DB_PASSWORD=YourPassword # SQL Server Password
DB_SERVER=localhost      # Server Address (e.g., localhost or localhost\SQLEXPRESS)
DB_NAME=EmployeeManagement
```

### Running the Application

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Mode**:
    ```bash
    npm run dev
    ```
    This will start both the React renderer (port 5173) and the Electron main process.

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Development Notes
*   **IPC Handlers**: Located in `src/main/ipc`. These define the API callable from the frontend.
*   **Repositories**: Located in `src/main/db/repositories`. These contain the raw SQL queries.
*   **Components**: Located in `src/renderer/src/components`. Organized by feature and type.
