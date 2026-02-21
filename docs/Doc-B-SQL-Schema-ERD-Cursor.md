# Doc B — Employee Management — SQL Schema & ERD (Ready for Cursor)

## Table of Contents
1. [Conventions](#conventions)
2. [Entity List & ERD](#entity-list--erd)
3. [DDL (Copy-Ready)](#ddl-copy-ready)
4. [Indexes](#indexes)
5. [Computed / Derived Fields](#computed--derived-fields)
6. [Sample Seed Data](#sample-seed-data)
7. [Excel Import Mapping](#excel-import-mapping)
8. [Attachment Rules](#attachment-rules)
9. [Migration Notes](#migration-notes)

---

## Conventions

### Naming Standards
- **Table Names**: snake_case, plural (employees, courses, evaluations)
- **Column Names**: snake_case (full_name, hire_date, created_at)
- **Primary Keys**: id (auto-increment integer)
- **Foreign Keys**: [table]_id (employee_id, course_id)

### Common Columns
```sql
-- Standard audit columns for all tables
id INTEGER PRIMARY KEY AUTOINCREMENT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
created_by INTEGER, -- References users table (future)
updated_by INTEGER  -- References users table (future)
```

### Soft Delete Pattern
```sql
-- Soft delete columns (where applicable)
is_deleted BOOLEAN DEFAULT FALSE,
deleted_at DATETIME NULL,
deleted_by INTEGER NULL
```

### Timestamp Handling
- **Storage**: UTC timestamps only
- **Display**: Convert to local timezone in application
- **Format**: ISO 8601 standard (YYYY-MM-DD HH:MM:SS)

---

## Entity List & ERD

### Core Entities
1. **employees** (Master entity)
2. **courses** (Training records)
3. **evaluations** (Performance reviews)
4. **promotions** (Career advancement)
5. **rewards** (Recognition & bonuses)
6. **leaves** (Vacation & leave requests)
7. **absences** (Unplanned absences)
8. **years_of_service** (Service calculations)
9. **payrolls** (Salary & compensation)
10. **salary_grades** (Static reference data)
11. **exchange_rates** (Currency conversion rates)
12. **attachments** (Universal file storage)

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│   employees     │
│ ─────────────── │
│ id (PK)         │
│ employee_no     │
│ full_name       │
│ hire_date       │
│ job_title       │
│ ...             │
└─────────────────┘
         │
         │ 1:N
         ├─────────────────────────────────────────────────┐
         │                                                 │
┌─────────────────┐  ┌─────────────────┐  ┌��────────────────┐
│    courses      │  │  evaluations    │  │  promotions     │
│ ─────────────── │  │ ─────────────── │  │ ─────────────── │
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ employee_id(FK) │  │ employee_id(FK) │  │ employee_id(FK) │
│ course_name     │  │ eval_date       │  │ promo_type      │
│ start_date      │  │ score           │  │ promo_date      │
│ ...             │  │ ...             │  │ ...             │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    rewards      │  │     leaves      │  │    absences     │
│ ─────────────── │  │ ─────────────── │  │ ─────────────── │
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ employee_id(FK) │  │ employee_id(FK) │  │ employee_id(FK) │
│ reward_type     │  │ leave_type      │  │ from_date       │
│ reward_date     │  │ from_date       │  │ to_date         │
│ ...             │  │ ...             │  │ ...             │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ years_of_service│  │    payrolls     │
│ ─────────────── │  │ ─────────────── │
│ id (PK)         │  │ id (PK)         │
│ employee_id(FK) │  │ employee_id(FK) │
│ from_date       │  │ gross_salary    │
│ to_date         │  │ net_salary      │
│ total_days      │  │ currency        │
│ ...             │  │ ...             │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ salary_grades   │  │  attachments    │
│ ─────────────── │  │ ─────────────── ��
│ id (PK)         │  │ id (PK)         │
│ grade_name      │  │ entity_type     │
│ min_base        │  │ entity_id       │
│ admin_level     │  │ file_name       │
│ ...             │  │ storage_url     │
└─────────────────┘  └─────────────────┘
                              │
                              │ Polymorphic
                              │ References any entity
```

### Relationship Types
- **One-to-Many**: employees → all child entities
- **Polymorphic**: attachments → any entity via entity_type + entity_id
- **Reference**: salary_grades, exchange_rates (static lookup tables)
- **Currency**: All monetary amounts stored in USD, converted via exchange_rates

---

## DDL (Copy-Ready)

### SQLite Schema (Primary Target)

#### 1. Employees Table (Master)
```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_no VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    job_title VARCHAR(100),
    grade VARCHAR(50),
    department VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    photo_url VARCHAR(500),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME NULL,
    deleted_by INTEGER NULL,
    
    CONSTRAINT chk_employee_no_format CHECK (LENGTH(employee_no) >= 3),
    CONSTRAINT chk_hire_date_not_future CHECK (hire_date <= DATE('now'))
);
```

#### 2. Courses Table
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    organizer VARCHAR(100),
    result VARCHAR(50), -- 'passed', 'failed', 'in_progress'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_course_dates CHECK (
        end_date IS NULL OR end_date >= start_date
    )
);
```

#### 3. Evaluations Table
```sql
CREATE TABLE evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    eval_date DATE NOT NULL,
    score DECIMAL(5,2), -- 0.00 to 100.00
    rating_text VARCHAR(50), -- 'excellent', 'good', 'average', 'poor'
    evaluator VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_score_range CHECK (
        score IS NULL OR (score >= 0 AND score <= 100)
    )
);
```

#### 4. Promotions Table
```sql
CREATE TABLE promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    promo_type VARCHAR(50) NOT NULL, -- 'grade', 'position', 'salary'
    promo_date DATE NOT NULL,
    reference VARCHAR(100), -- Decision reference number
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT
);
```

#### 5. Rewards Table
```sql
CREATE TABLE rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'bonus', 'recognition', 'gift'
    reward_date DATE NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    reference VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_amount_positive CHECK (amount >= 0)
);
```

#### 6. Leaves Table
```sql
CREATE TABLE leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'annual', 'sick', 'emergency', 'maternity'
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    duration_days INTEGER GENERATED ALWAYS AS (
        julianday(to_date) - julianday(from_date) + 1
    ) STORED,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_leave_dates CHECK (to_date >= from_date)
);
```

#### 7. Absences Table
```sql
CREATE TABLE absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count INTEGER GENERATED ALWAYS AS (
        julianday(to_date) - julianday(from_date) + 1
    ) STORED,
    reason VARCHAR(200),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_absence_dates CHECK (to_date >= from_date)
);
```

#### 8. Years of Service Table
```sql
CREATE TABLE years_of_service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    from_date DATE NOT NULL, -- Usually hire_date
    to_date DATE NOT NULL,   -- Calculation date
    total_days INTEGER GENERATED ALWAYS AS (
        julianday(to_date) - julianday(from_date)
    ) STORED,
    years INTEGER,
    months INTEGER,
    days INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_service_dates CHECK (to_date >= from_date)
);
```

#### 9. Payrolls Table
```sql
CREATE TABLE payrolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Salary Components
    min_base DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    admin_level DECIMAL(10,2) DEFAULT 0.00,
    degree_allowance DECIMAL(10,2) DEFAULT 0.00,
    experience_allowance DECIMAL(10,2) DEFAULT 0.00,
    years_experience INTEGER DEFAULT 0,
    extra_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Deductions
    advances DECIMAL(10,2) DEFAULT 0.00,
    loans DECIMAL(10,2) DEFAULT 0.00,
    deductions DECIMAL(10,2) DEFAULT 0.00,
    
    -- Calculated Fields
    gross_salary DECIMAL(10,2) GENERATED ALWAYS AS (
        min_base + admin_level + degree_allowance + 
        (experience_allowance * years_experience) + extra_amount
    ) STORED,
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (
        min_base + admin_level + degree_allowance + 
        (experience_allowance * years_experience) + extra_amount - 
        (advances + loans + deductions)
    ) STORED,
    
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    
    CONSTRAINT chk_positive_amounts CHECK (
        min_base >= 0 AND admin_level >= 0 AND degree_allowance >= 0 AND
        experience_allowance >= 0 AND years_experience >= 0 AND
        extra_amount >= 0 AND advances >= 0 AND loans >= 0 AND deductions >= 0
    )
);
```

#### 10. Salary Grades Table (Reference)
```sql
CREATE TABLE salary_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade_name VARCHAR(50) UNIQUE NOT NULL,
    min_base DECIMAL(10,2) NOT NULL,
    admin_level DECIMAL(10,2) DEFAULT 0.00,
    degree_allowance DECIMAL(10,2) DEFAULT 0.00,
    experience_allowance DECIMAL(10,2) DEFAULT 0.00,
    max_experience INTEGER DEFAULT 20, -- Maximum years considered
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_grade_amounts CHECK (
        min_base > 0 AND admin_level >= 0 AND 
        degree_allowance >= 0 AND experience_allowance >= 0
    )
);
```

#### 11. Exchange Rates Table (Currency Conversion)
```sql
CREATE TABLE exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    target_currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
    rate DECIMAL(10,4) NOT NULL,
    effective_from DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    note VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    CONSTRAINT chk_positive_rate CHECK (rate > 0),
    CONSTRAINT chk_currency_codes CHECK (
        LENGTH(base_currency) = 3 AND LENGTH(target_currency) = 3
    ),
    CONSTRAINT chk_different_currencies CHECK (base_currency != target_currency),
    
    -- Only one active rate per currency pair
    UNIQUE(base_currency, target_currency, is_active) 
        WHERE is_active = TRUE
);
```

#### 12. Attachments Table (Universal)
```sql
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type VARCHAR(50) NOT NULL, -- 'employee', 'course', 'evaluation', etc.
    entity_id INTEGER NOT NULL,       -- References the specific record
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),            -- MIME type
    file_size INTEGER,                -- Size in bytes
    storage_url VARCHAR(500) NOT NULL, -- Full path to file
    note VARCHAR(500),                -- Optional description
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    CONSTRAINT chk_file_size CHECK (file_size > 0),
    CONSTRAINT chk_valid_entity_type CHECK (
        entity_type IN ('employee', 'course', 'evaluation', 'promotion', 
                       'reward', 'leave', 'absence', 'payroll')
    )
);
```

### SQL Server Adaptations
```sql
-- Key differences for SQL Server:

-- 1. Auto-increment syntax
id INT IDENTITY(1,1) PRIMARY KEY

-- 2. Boolean type
is_deleted BIT DEFAULT 0

-- 3. Current timestamp
created_at DATETIME2 DEFAULT GETUTCDATE()

-- 4. Computed columns syntax
duration_days AS (DATEDIFF(day, from_date, to_date) + 1) PERSISTED

-- 5. String length
VARCHAR(MAX) for TEXT fields
NVARCHAR for Unicode support
```

---

## Indexes

### Performance Indexes (SQLite)
```sql
-- Employees table indexes
CREATE UNIQUE INDEX idx_employees_employee_no ON employees(employee_no);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_is_deleted ON employees(is_deleted);

-- Foreign key indexes for child tables
CREATE INDEX idx_courses_employee_id ON courses(employee_id);
CREATE INDEX idx_evaluations_employee_id ON evaluations(employee_id);
CREATE INDEX idx_promotions_employee_id ON promotions(employee_id);
CREATE INDEX idx_rewards_employee_id ON rewards(employee_id);
CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_absences_employee_id ON absences(employee_id);
CREATE INDEX idx_years_of_service_employee_id ON years_of_service(employee_id);
CREATE INDEX idx_payrolls_employee_id ON payrolls(employee_id);

-- Date-based lookups
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_evaluations_eval_date ON evaluations(eval_date);
CREATE INDEX idx_promotions_promo_date ON promotions(promo_date);
CREATE INDEX idx_rewards_reward_date ON rewards(reward_date);
CREATE INDEX idx_leaves_date_range ON leaves(from_date, to_date);
CREATE INDEX idx_absences_date_range ON absences(from_date, to_date);

-- Attachments polymorphic index
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_created_at ON attachments(created_at);

-- Salary grades lookup
CREATE UNIQUE INDEX idx_salary_grades_name ON salary_grades(grade_name);

-- Exchange rates indexes
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX idx_exchange_rates_active ON exchange_rates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_exchange_rates_effective_date ON exchange_rates(effective_from);

-- Composite indexes for common queries
CREATE INDEX idx_leaves_employee_type ON leaves(employee_id, leave_type);
CREATE INDEX idx_rewards_employee_date ON rewards(employee_id, reward_date);
CREATE INDEX idx_payrolls_employee_created ON payrolls(employee_id, created_at);
```

---

## Computed / Derived Fields

### Application vs Database Calculations
```sql
-- Database-computed (GENERATED columns)
-- ✅ Simple mathematical operations
-- ✅ Date differences  
duration_days = julianday(to_date) - julianday(from_date) + 1
gross_salary = min_base + admin_level + degree_allowance + ...

-- Application-computed (Complex logic)
-- ✅ Service years breakdown (years, months, days)
-- ✅ Leave balance calculations
-- ✅ Performance rating logic
```

### Summary Views
```sql
-- Leave totals by employee and type
CREATE VIEW v_leave_totals AS
SELECT 
    employee_id,
    leave_type,
    COUNT(*) as leave_count,
    SUM(duration_days) as total_days,
    SUM(CASE WHEN strftime('%Y', from_date) = strftime('%Y', 'now') 
             THEN duration_days ELSE 0 END) as ytd_days
FROM leaves 
GROUP BY employee_id, leave_type;

-- Latest payroll by employee
CREATE VIEW v_payroll_latest AS  
SELECT DISTINCT
    employee_id,
    gross_salary,
    net_salary,
    strftime('%m', created_at) as month,
    strftime('%Y', created_at) as year,
    created_at
FROM payrolls p1
WHERE created_at = (
    SELECT MAX(created_at) 
    FROM payrolls p2 
    WHERE p2.employee_id = p1.employee_id
);

-- Employee summary with key metrics
CREATE VIEW v_employee_summary AS
SELECT 
    e.id,
    e.employee_no,
    e.full_name,
    e.job_title,
    e.department,
    e.hire_date,
    
    -- Service calculation
    CAST((julianday('now') - julianday(e.hire_date)) / 365.25 AS INTEGER) as service_years,
    
    -- Latest payroll
    p.gross_salary,
    p.net_salary,
    
    -- Leave summary
    COALESCE(l.total_annual_days, 0) as annual_leave_taken,
    COALESCE(a.absence_count, 0) as absence_count,
    
    -- Performance
    COALESCE(ev.latest_score, 0) as latest_evaluation_score
    
FROM employees e
LEFT JOIN v_payroll_latest p ON e.id = p.employee_id
LEFT JOIN (
    SELECT employee_id, SUM(duration_days) as total_annual_days
    FROM leaves 
    WHERE leave_type = 'annual' 
      AND strftime('%Y', from_date) = strftime('%Y', 'now')
    GROUP BY employee_id
) l ON e.id = l.employee_id
LEFT JOIN (
    SELECT employee_id, COUNT(*) as absence_count
    FROM absences
    WHERE strftime('%Y', from_date) = strftime('%Y', 'now')
    GROUP BY employee_id  
) a ON e.id = a.employee_id
LEFT JOIN (
    SELECT employee_id, score as latest_score
    FROM evaluations ev1
    WHERE eval_date = (
        SELECT MAX(eval_date) 
        FROM evaluations ev2 
        WHERE ev2.employee_id = ev1.employee_id
    )
) ev ON e.id = ev.employee_id
WHERE e.is_deleted = FALSE;
```

---

## Sample Seed Data

### Insert Sample Data
```sql
-- Salary grades (reference data) - converted to USD
INSERT INTO salary_grades (grade_name, min_base, admin_level, degree_allowance, experience_allowance, max_experience) VALUES
('Junior', 1370.00, 0.00, 137.00, 55.00, 10),
('Mid-Level', 2192.00, 274.00, 219.00, 82.00, 15),  
('Senior', 3288.00, 548.00, 274.00, 110.00, 20),
('Manager', 4110.00, 822.00, 411.00, 137.00, 25);

-- Sample employees
INSERT INTO employees (employee_no, full_name, hire_date, job_title, grade, department, phone, email) VALUES
('EMP001', 'أحمد محمد علي', '2020-03-15', 'مطور برمجيات أول', 'Senior', 'تقنية المعلومات', '+966501234567', 'ahmed.mohamed@company.com'),
('EMP002', 'فاطمة أحمد السالم', '2021-07-01', 'محاسبة', 'Mid-Level', 'المالية', '+966502345678', 'fatima.salem@company.com'),
('EMP003', 'محمد عبدالله الرشيد', '2019-01-20', 'مدير الموارد البشرية', 'Manager', 'الموارد البشرية', '+966503456789', 'mohammed.rashid@company.com');

-- Sample courses
INSERT INTO courses (employee_id, course_name, start_date, end_date, organizer, result) VALUES
(1, 'دورة تطوير تطبيقات الويب المتقدمة', '2024-01-15', '2024-01-19', 'معهد التقنية', 'passed'),
(1, 'شهادة AWS Cloud Practitioner', '2024-03-01', '2024-03-15', 'Amazon Web Services', 'passed'),
(2, 'دورة المحاسبة المتقدمة', '2024-02-01', '2024-02-05', 'معهد المحاسبة', 'passed');

-- Sample evaluations  
INSERT INTO evaluations (employee_id, eval_date, score, rating_text, evaluator) VALUES
(1, '2024-06-30', 92.50, 'ممتاز', 'سارة أحمد - مدير القسم'),
(2, '2024-06-30', 87.00, 'جيد جداً', 'محمد الرشيد - مدير الموارد ا��بشرية'),
(3, '2024-06-30', 95.00, 'ممتاز', 'علي السالم - المدير العام');

-- Sample promotions
INSERT INTO promotions (employee_id, promo_type, promo_date, reference, notes) VALUES
(1, 'grade', '2024-04-01', 'QR-2024-001', 'ترقية من Mid-Level إلى Senior'),
(2, 'salary', '2024-07-01', 'QR-2024-015', 'زيادة راتب 15%');

-- Sample exchange rates
INSERT INTO exchange_rates (base_currency, target_currency, rate, effective_from, is_active, note, created_by) VALUES
('USD', 'TRY', 36.50, '2024-09-24', TRUE, 'Current exchange rate', 1),
('USD', 'TRY', 35.80, '2024-09-15', FALSE, 'Previous rate', 1);

-- Sample rewards (converted to USD)
INSERT INTO rewards (employee_id, reward_type, reward_date, amount, reference, notes) VALUES
(1, 'bonus', '2024-08-15', 548.00, 'BONUS-2024-Q2', 'مكافأة الأداء المتميز - الربع الثاني'),
(3, 'recognition', '2024-09-01', 0.00, 'REC-2024-001', 'شهادة تقدير للقيادة المتميزة');

-- Sample leaves
INSERT INTO leaves (employee_id, leave_type, from_date, to_date, notes) VALUES
(1, 'annual', '2024-08-01', '2024-08-07', 'إجازة صيفية'),
(2, 'sick', '2024-07-15', '2024-07-16', 'إجازة مرضية'),
(3, 'emergency', '2024-09-10', '2024-09-10', 'ظروف طارئة');

-- Sample absences
INSERT INTO absences (employee_id, from_date, to_date, reason, notes) VALUES
(2, '2024-06-05', '2024-06-05', 'مشكلة في المواصلات', 'تأخير في وصول الحافلة');

-- Sample service years calculation
INSERT INTO years_of_service (employee_id, from_date, to_date, years, months, days) VALUES
(1, '2020-03-15', '2024-09-24', 4, 6, 9),
(2, '2021-07-01', '2024-09-24', 3, 2, 23),
(3, '2019-01-20', '2024-09-24', 5, 8, 4);

-- Sample payroll
INSERT INTO payrolls (
    employee_id, min_base, admin_level, degree_allowance, 
    experience_allowance, years_experience, extra_amount,
    advances, loans, deductions, notes
) VALUES
(1, 3288.00, 548.00, 274.00, 110.00, 4, 137.00, 274.00, 548.00, 41.00, 'راتب سبتمبر 2024'),
(2, 2192.00, 274.00, 219.00, 82.00, 3, 55.00, 137.00, 0.00, 27.00, 'راتب سبتمبر 2024'),
(3, 4110.00, 822.00, 411.00, 137.00, 5, 274.00, 0.00, 411.00, 55.00, 'راتب سبتمبر 2024');

-- Sample attachments
INSERT INTO attachments (entity_type, entity_id, file_name, file_type, file_size, storage_url, note, created_by) VALUES
('employee', 1, 'ahmed_cv.pdf', 'application/pdf', 245760, '/uploads/employees/1/ahmed_cv.pdf', 'السيرة الذاتية', 1),
('employee', 1, 'certificates.pdf', 'application/pdf', 187392, '/uploads/employees/1/certificates.pdf', 'الشهادات العلمية', 1),
('course', 1, 'course_certificate.pdf', 'application/pdf', 156234, '/uploads/courses/1/course_certificate.pdf', 'شهادة إتمام الدورة', 1),
('evaluation', 1, 'performance_review_2024.pdf', 'application/pdf', 198456, '/uploads/evaluations/1/performance_review_2024.pdf', 'تقرير التقييم السنوي', 1);
```

---

## Excel Import Mapping

### Column Mapping Table
| Excel Column | Header (English) | Header (Arabic) | Database Field | Required | Validation |
|--------------|------------------|-----------------|----------------|----------|------------|
| A | Employee No | رقم الموظف | employee_no | Yes | Unique, min 3 chars |
| B | Full Name | الاسم الكامل | full_name | Yes | Max 255 chars |
| C | Hire Date | تاريخ التعيين | hire_date | Yes | Valid date, not future |
| D | Job Title | المسمى الوظيفي | job_title | No | Max 100 chars |
| E | Grade | الدرجة الوظيفية | grade | No | Max 50 chars |
| F | Department | القسم | department | No | Max 100 chars |
| G | Phone | رقم الهاتف | phone | No | Max 20 chars |
| H | Email | البريد الإلكتروني | email | No | Valid email format |
| I | Notes | ملاحظات | notes | No | Text field |

### Validation Rules
```javascript
const validationRules = {
  employee_no: {
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9]+$/
  },
  
  full_name: {
    required: true,
    maxLength: 255,
    pattern: /^[\u0600-\u06FF\s\w]+$/ // Arabic and English characters
  },
  
  hire_date: {
    required: true,
    type: 'date',
    maxDate: 'today'
  },
  
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  phone: {
    required: false,
    pattern: /^(\+966|0)?[0-9]{9}$/ // Saudi phone format
  }
};
```

### Duplicate Detection Logic
```sql
-- Check for duplicates during import
SELECT employee_no, full_name, COUNT(*) as duplicate_count
FROM temp_import_table 
GROUP BY employee_no, full_name 
HAVING COUNT(*) > 1;

-- Check against existing records
SELECT t.employee_no, t.full_name
FROM temp_import_table t
INNER JOIN employees e ON (
    t.employee_no = e.employee_no OR 
    (t.full_name = e.full_name AND t.hire_date = e.hire_date)
)
WHERE e.is_deleted = FALSE;
```

### Import Process Steps
```sql
-- 1. Create temporary table
CREATE TEMP TABLE temp_import_employees AS 
SELECT * FROM employees WHERE 1=0;

-- 2. Insert validated data
INSERT INTO temp_import_employees (employee_no, full_name, hire_date, ...)
SELECT ... FROM imported_data WHERE validation_passed = 1;

-- 3. Transfer to main table
INSERT INTO employees (employee_no, full_name, hire_date, ...)
SELECT employee_no, full_name, hire_date, ...
FROM temp_import_employees;

-- 4. Clean up
DROP TABLE temp_import_employees;
```

---

## Attachment Rules

### File Restrictions
```javascript
const attachmentRules = {
  maxFileSize: 5 * 1024 * 1024, // 5MB per file
  maxFilesPerRecord: 10,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ],
  
  // File extensions mapping
  typeExtensions: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  }
};
```

### Storage Path Strategy
```javascript
// Electron app data folder structure
const storagePaths = {
  base: '/app-data/employee-management/uploads',
  
  // Organized by entity type and ID
  employee: '/uploads/employees/{employee_id}/',
  course: '/uploads/courses/{course_id}/',
  evaluation: '/uploads/evaluations/{evaluation_id}/',
  promotion: '/uploads/promotions/{promotion_id}/',
  reward: '/uploads/rewards/{reward_id}/',
  leave: '/uploads/leaves/{leave_id}/',
  absence: '/uploads/absences/{absence_id}/',
  payroll: '/uploads/payrolls/{payroll_id}/'
};

// Example full path
// /app-data/employee-management/uploads/employees/1/contract_signed.pdf
```

### Deletion Policy
```sql
-- Soft delete attachments (recommended)
UPDATE attachments 
SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, deleted_by = ?
WHERE id = ?;

-- Hard delete (if space is critical)
-- 1. Delete file from filesystem first
-- 2. Then delete database record
DELETE FROM attachments WHERE id = ?;
```

### Security Considerations
```javascript
const securityRules = {
  // File validation
  validateFileContent: true, // Check actual file content, not just extension
  
  // Virus scanning (if available)
  virusScan: false, // Enable if antivirus API available
  
  // Access control
  requireAuth: true, // Only authenticated users can upload/download
  
  // File sanitization
  sanitizeFileName: true, // Remove special characters from file names
  
  // Storage isolation
  isolateUploads: true // Store uploads outside web root
};
```

---

## Migration Notes

### SQLite Setup (Electron)
```sql
-- Enable foreign key constraints (important!)
PRAGMA foreign_keys = ON;

-- Set WAL mode for better concurrency
PRAGMA journal_mode = WAL;

-- Set synchronous mode
PRAGMA synchronous = NORMAL;

-- Set cache size (10MB)
PRAGMA cache_size = -10000;

-- Enable automatic indexing
PRAGMA automatic_index = ON;
```

### SQL Server Migration Path
```sql
-- 1. Data type conversions
-- SQLite INTEGER → SQL Server INT
-- SQLite REAL → SQL Server DECIMAL(10,2)
-- SQLite TEXT → SQL Server NVARCHAR(MAX)
-- SQLite BOOLEAN → SQL Server BIT

-- 2. Identity columns
-- SQLite: id INTEGER PRIMARY KEY AUTOINCREMENT
-- SQL Server: id INT IDENTITY(1,1) PRIMARY KEY

-- 3. Date functions
-- SQLite: julianday(), date(), strftime()
-- SQL Server: DATEDIFF(), CONVERT(), FORMAT()

-- 4. Computed columns
-- SQLite: GENERATED ALWAYS AS (...) STORED
-- SQL Server: AS (...) PERSISTED
```

### Transaction Boundaries
```sql
-- Import operations (use transactions)
BEGIN TRANSACTION;
    -- Validate all data first
    -- Insert/update operations
    -- Error handling
COMMIT; -- or ROLLBACK on error

-- Bulk operations
BEGIN TRANSACTION;
    -- Disable foreign key checks temporarily (SQLite)
    PRAGMA foreign_keys = OFF;
    
    -- Bulk insert operations
    
    -- Re-enable foreign key checks
    PRAGMA foreign_keys = ON;
COMMIT;
```

### Database Backup Strategy
```javascript
// Electron app backup
const backupStrategy = {
  // Automatic daily backups
  schedule: 'daily at 02:00',
  
  // Backup location
  location: '/app-data/employee-management/backups/',
  
  // Retention policy
  keepDays: 30,
  
  // Backup format
  format: 'sqlite_backup', // Using SQLite backup API
  
  // Compression
  compress: true
};
```

### Performance Considerations
```sql
-- For large datasets (>100K records), consider:

-- 1. Partitioning by date (SQL Server)
CREATE PARTITION FUNCTION pf_yearly_range (DATE)
AS RANGE RIGHT FOR VALUES ('2020-01-01', '2021-01-01', '2022-01-01', ...);

-- 2. Archive old data
CREATE TABLE employees_archive AS SELECT * FROM employees WHERE hire_date < '2015-01-01';

-- 3. Optimize queries with EXPLAIN QUERY PLAN (SQLite)
EXPLAIN QUERY PLAN SELECT * FROM employees WHERE department = 'IT';
```

---

**Schema Status**: Production Ready
**Database**: SQLite (Primary), SQL Server (Migration Ready)
**Last Updated**: September 24, 2024
**Version**: 1.0
**Ready for**: Cursor Import, Development Implementation

---

## Quick Implementation Checklist

- ✅ Create all tables with proper constraints
- ✅ Add all indexes for performance
- ✅ Create summary views for reports
- ✅ Insert reference data (salary_grades)
- ✅ Test foreign key relationships
- ✅ Verify computed column calculations
- ✅ Set up backup strategy
- ✅ Configure PRAGMA settings
- ✅ Test import/export procedures
- ✅ Validate attachment storage paths