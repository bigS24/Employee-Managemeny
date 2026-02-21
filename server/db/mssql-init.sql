-- Employees
IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
    CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_no NVARCHAR(50) NOT NULL,
        full_name NVARCHAR(255) NOT NULL,
        hire_date NVARCHAR(20) NOT NULL,
        job_title NVARCHAR(255) NOT NULL,
        department NVARCHAR(255) NOT NULL,
        phone NVARCHAR(50),
        email NVARCHAR(255),
        status NVARCHAR(50) NOT NULL DEFAULT 'active',
        education_degree NVARCHAR(100),
        category NVARCHAR(50),
        grade NVARCHAR(50),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME
    );
    CREATE UNIQUE INDEX idx_employees_no ON employees(employee_no);
END

-- Add missing columns if table exists (Migration-like behavior)
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'education_degree' AND Object_ID = Object_ID(N'employees'))
BEGIN
    ALTER TABLE employees ADD education_degree NVARCHAR(100);
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'category' AND Object_ID = Object_ID(N'employees'))
BEGIN
    ALTER TABLE employees ADD category NVARCHAR(50);
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'grade' AND Object_ID = Object_ID(N'employees'))
BEGIN
    ALTER TABLE employees ADD grade NVARCHAR(50);
END

-- Employee Attachments
IF OBJECT_ID('dbo.employee_attachments', 'U') IS NULL
BEGIN
    CREATE TABLE employee_attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        file_path NVARCHAR(MAX) NOT NULL,
        file_type NVARCHAR(50),
        file_size BIGINT,
        uploaded_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_attachments_employee ON employee_attachments(employee_id);
END

-- Courses
IF OBJECT_ID('dbo.courses', 'U') IS NULL
BEGIN
    CREATE TABLE courses (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        course_name NVARCHAR(255) NOT NULL,
        provider NVARCHAR(255) NOT NULL,
        start_date NVARCHAR(20) NOT NULL,
        end_date NVARCHAR(20) NOT NULL,
        result NVARCHAR(100),
        grade NVARCHAR(50),
        status NVARCHAR(50) NOT NULL DEFAULT 'planned',
        attachment_name NVARCHAR(255),
        attachment_path NVARCHAR(MAX),
        attachment_size BIGINT,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_courses_employee ON courses(employee_id);
END

-- Evaluations
IF OBJECT_ID('dbo.evaluations', 'U') IS NULL
BEGIN
    CREATE TABLE evaluations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        evaluator_id INT,
        period NVARCHAR(50) NOT NULL,
        overall_score FLOAT NOT NULL,
        rating NVARCHAR(50) NOT NULL,
        goals_percent FLOAT NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'قيد المراجعة',
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (evaluator_id) REFERENCES employees(id) ON DELETE NO ACTION
    );
    CREATE INDEX idx_eval_employee ON evaluations(employee_id);
END

-- Promotions
IF OBJECT_ID('dbo.promotions', 'U') IS NULL
BEGIN
    CREATE TABLE promotions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        from_title NVARCHAR(255),
        to_title NVARCHAR(255),
        from_grade INT,
        to_grade INT,
        promo_type NVARCHAR(50) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'في الانتظار',
        effective_date NVARCHAR(20) NOT NULL,
        increase_amount_usd FLOAT,
        increase_percent FLOAT,
        notes NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_promotions_employee ON promotions(employee_id);
END

-- Rewards
IF OBJECT_ID('dbo.rewards', 'U') IS NULL
BEGIN
    CREATE TABLE rewards (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        kind NVARCHAR(50) NOT NULL,
        category NVARCHAR(50) NOT NULL,
        amount_usd FLOAT,
        reward_date NVARCHAR(20) NOT NULL,
        status NVARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_rewards_employee ON rewards(employee_id);
END

-- Leaves
IF OBJECT_ID('dbo.leaves', 'U') IS NULL
BEGIN
    CREATE TABLE leaves (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        leave_type NVARCHAR(100),
        from_date NVARCHAR(20) NOT NULL,
        to_date NVARCHAR(20) NOT NULL,
        days INT DEFAULT 0,
        status NVARCHAR(50) DEFAULT 'في الانتظار',
        reason NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_leaves_employee ON leaves(employee_id);
END

-- Absences
IF OBJECT_ID('dbo.absences', 'U') IS NULL
BEGIN
    CREATE TABLE absences (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        from_date NVARCHAR(20) NOT NULL,
        to_date NVARCHAR(20) NOT NULL,
        days_count INT NOT NULL,
        reason NVARCHAR(MAX),
        fine_amount FLOAT NOT NULL DEFAULT 0,
        direct_manager_notes NVARCHAR(MAX),
        hr_manager_notes NVARCHAR(MAX),
        manager_notes NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_absences_employee ON absences(employee_id);
END

-- Add missing columns to absences if table exists (Migration-like behavior)
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'direct_manager_notes' AND Object_ID = Object_ID(N'absences'))
BEGIN
    ALTER TABLE absences ADD direct_manager_notes NVARCHAR(MAX);
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'hr_manager_notes' AND Object_ID = Object_ID(N'absences'))
BEGIN
    ALTER TABLE absences ADD hr_manager_notes NVARCHAR(MAX);
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'manager_notes' AND Object_ID = Object_ID(N'absences'))
BEGIN
    ALTER TABLE absences ADD manager_notes NVARCHAR(MAX);
END

-- Attachments
IF OBJECT_ID('dbo.attachments', 'U') IS NULL
BEGIN
    CREATE TABLE attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        entity_type NVARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        file_type NVARCHAR(50),
        file_size BIGINT,
        storage_url NVARCHAR(MAX),
        note NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        created_by NVARCHAR(255)
    );
    CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
END

-- Exchange Rates
IF OBJECT_ID('dbo.exchange_rates', 'U') IS NULL
BEGIN
    CREATE TABLE exchange_rates (
        id INT IDENTITY(1,1) PRIMARY KEY,
        base_currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
        target_currency NVARCHAR(10) NOT NULL DEFAULT 'TRY',
        rate FLOAT NOT NULL CHECK (rate > 0),
        effective_from NVARCHAR(20) NOT NULL,
        is_active BIT NOT NULL DEFAULT 0,
        note NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        created_by NVARCHAR(255)
    );
END

-- Payroll Snapshots
IF OBJECT_ID('dbo.payroll_snapshots', 'U') IS NULL
BEGIN
    CREATE TABLE payroll_snapshots (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        month NVARCHAR(10) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'مسودّة',
        
        base_salary_usd FLOAT NOT NULL,
        admin_allowance_usd FLOAT DEFAULT 0,
        education_allowance_usd FLOAT DEFAULT 0,
        housing_allowance_usd FLOAT DEFAULT 0,
        transport_allowance_usd FLOAT DEFAULT 0,
        col_allowance_usd FLOAT DEFAULT 0,
        children_allowance_usd FLOAT DEFAULT 0,
        special_allowance_usd FLOAT DEFAULT 0,
        fuel_allowance_usd FLOAT DEFAULT 0,
        eos_accrual_usd FLOAT DEFAULT 0,
        exceptional_additions_usd FLOAT DEFAULT 0,
        deduction_loan_penalty_usd FLOAT DEFAULT 0,
        deduction_payment_usd FLOAT DEFAULT 0,
        deductions_other_usd FLOAT DEFAULT 0,
        overtime_hours FLOAT DEFAULT 0,
        
        salary_sum_usd FLOAT,
        salary_total_usd FLOAT,
        daily_rate_usd FLOAT,
        hourly_rate_usd FLOAT,
        overtime_value_usd FLOAT,
        deductions_usd FLOAT,
        net_salary_usd FLOAT,
        
        rate_used FLOAT,
        salary_sum_try FLOAT,
        salary_total_try FLOAT,
        daily_rate_try FLOAT,
        hourly_rate_try FLOAT,
        overtime_value_try FLOAT,
        deductions_try FLOAT,
        net_salary_try FLOAT,
        
        audit_json NVARCHAR(MAX),
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX idx_payroll_snapshots_unique ON payroll_snapshots(employee_id, month);
    CREATE INDEX idx_payroll_snapshots_month ON payroll_snapshots(month);
END

-- Payroll Headers
IF OBJECT_ID('dbo.payroll_headers', 'U') IS NULL
BEGIN
    CREATE TABLE payroll_headers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        period NVARCHAR(20) NOT NULL,
        id_number NVARCHAR(50),
        start_date NVARCHAR(20),
        admin_level NVARCHAR(100),
        job_title NVARCHAR(255),
        edu_actual NVARCHAR(255),
        edu_required NVARCHAR(255),
        base_min FLOAT NOT NULL DEFAULT 0,
        years_of_exp INT NOT NULL DEFAULT 0,
        notes NVARCHAR(MAX),
        
        base_min_currency NVARCHAR(10) NOT NULL DEFAULT 'TRY',
        experience_allowance_amount FLOAT NOT NULL DEFAULT 0,
        experience_allowance_currency NVARCHAR(10) NOT NULL DEFAULT 'TRY',

        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX idx_payroll_headers_unique ON payroll_headers(employee_id, period);
END

-- Payroll Lines
IF OBJECT_ID('dbo.payroll_lines', 'U') IS NULL
BEGIN
    CREATE TABLE payroll_lines (
        id INT IDENTITY(1,1) PRIMARY KEY,
        header_id INT NOT NULL,
        category NVARCHAR(50) NOT NULL,
        label NVARCHAR(255) NOT NULL,
        currency NVARCHAR(10) NOT NULL,
        amount FLOAT NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        FOREIGN KEY (header_id) REFERENCES payroll_headers(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_payroll_lines_header ON payroll_lines(header_id);
END

-- Departments
IF OBJECT_ID('dbo.departments', 'U') IS NULL
BEGIN
    CREATE TABLE departments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        manager_id INT,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Sections
IF OBJECT_ID('dbo.sections', 'U') IS NULL
BEGIN
    CREATE TABLE sections (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        department_id INT,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Locations
IF OBJECT_ID('dbo.locations', 'U') IS NULL
BEGIN
    CREATE TABLE locations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        address NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Holidays (Public Holidays)
IF OBJECT_ID('dbo.holidays', 'U') IS NULL
BEGIN
    CREATE TABLE holidays (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        start_date NVARCHAR(20) NOT NULL,
        end_date NVARCHAR(20) NOT NULL,
        days_count INT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Loans
IF OBJECT_ID('dbo.loans', 'U') IS NULL
BEGIN
    CREATE TABLE loans (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        amount FLOAT NOT NULL,
        currency NVARCHAR(10) DEFAULT 'USD',
        start_date NVARCHAR(20) NOT NULL,
        status NVARCHAR(50) DEFAULT 'active', -- active, paid, cancelled
        installments_count INT DEFAULT 1,
        amount_paid FLOAT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
END

-- Overtime records
IF OBJECT_ID('dbo.overtime', 'U') IS NULL
BEGIN
    CREATE TABLE overtime (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        date NVARCHAR(20) NOT NULL,
        hours FLOAT NOT NULL,
        rate_multiplier FLOAT DEFAULT 1.5,
        amount FLOAT, -- Calculated amount if fixed
        status NVARCHAR(50) DEFAULT 'pending',
        reason NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
END

-- Penalties
IF OBJECT_ID('dbo.penalties', 'U') IS NULL
BEGIN
    CREATE TABLE penalties (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employee_id INT NOT NULL,
        date NVARCHAR(20) NOT NULL,
        amount FLOAT NOT NULL,
        currency NVARCHAR(10) DEFAULT 'USD',
        reason NVARCHAR(MAX),
        status NVARCHAR(50) DEFAULT 'pending', -- pending, deducted
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
END

-- Users
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'user',
        employee_id INT,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX idx_users_username ON users(username);
END
