# Employee Management System - Complete Database Schema

## Overview
This document outlines the complete database schema for the Employee Management System with full CRUD operations and attachment functionality across all modules.

## Core Tables

### 1. Employees Table
```sql
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    grade VARCHAR(100),
    status ENUM('نشط', 'إجازة', 'متقاعد') DEFAULT 'نشط',
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    housing_allowance DECIMAL(10,2) DEFAULT 0,
    transport_allowance DECIMAL(10,2) DEFAULT 0,
    total_salary DECIMAL(10,2) GENERATED ALWAYS AS (basic_salary + allowances + housing_allowance + transport_allowance),
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Attachments Table (Universal for all modules)
```sql
CREATE TABLE attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('employee', 'course', 'evaluation', 'promotion', 'reward', 'leave', 'absence', 'salary') NOT NULL,
    entity_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL, -- e.g., 'certificate', 'documents', 'personalPhoto'
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_field (field_name),
    FOREIGN KEY (uploaded_by) REFERENCES employees(id)
);
```

### 3. Courses Table
```sql
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    category VARCHAR(100),
    location VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    status ENUM('مخطط', 'جاري', 'مكتمل', 'ملغي', 'مؤجل') DEFAULT 'مخطط',
    result ENUM('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'راسب', 'في التقدم') DEFAULT 'في التقدم',
    grade DECIMAL(5,2), -- Grade percentage
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);
```

### 4. Evaluations Table
```sql
CREATE TABLE evaluations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    evaluator_id BIGINT,
    evaluation_period VARCHAR(50) NOT NULL, -- e.g., '2023', 'Q1-2023'
    evaluation_date DATE NOT NULL,
    overall_score DECIMAL(3,2) NOT NULL, -- Out of 5.0
    performance_goals TEXT,
    achievements TEXT,
    areas_for_improvement TEXT,
    evaluator_notes TEXT,
    employee_comments TEXT,
    status ENUM('مسودة', 'مكتمل', 'معتمد') DEFAULT 'مسودة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_period (evaluation_period),
    INDEX idx_date (evaluation_date)
);
```

### 5. Evaluation Criteria Table
```sql
CREATE TABLE evaluation_criteria (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id BIGINT NOT NULL,
    criteria_name VARCHAR(255) NOT NULL,
    criteria_weight DECIMAL(5,2) NOT NULL, -- Percentage weight
    score DECIMAL(3,2) NOT NULL, -- Out of 5.0
    comments TEXT,
    
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    INDEX idx_evaluation (evaluation_id)
);
```

### 6. Promotions Table
```sql
CREATE TABLE promotions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    promotion_type ENUM('ترقية', 'نقل', 'تغيير منصب') NOT NULL,
    from_position VARCHAR(255) NOT NULL,
    to_position VARCHAR(255) NOT NULL,
    from_grade VARCHAR(100),
    to_grade VARCHAR(100),
    from_salary DECIMAL(10,2) NOT NULL,
    to_salary DECIMAL(10,2) NOT NULL,
    salary_increase DECIMAL(10,2) GENERATED ALWAYS AS (to_salary - from_salary),
    effective_date DATE NOT NULL,
    reason TEXT,
    approved_by BIGINT,
    approval_date DATE,
    status ENUM('مقترح', 'معتمد', 'مرفوض', 'مطبق') DEFAULT 'مقترح',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_effective_date (effective_date),
    INDEX idx_status (status)
);
```

### 7. Rewards Table
```sql
CREATE TABLE rewards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    reward_type ENUM('مكافأة مالية', 'شهادة تقدير', 'إجازة إضافية', 'ترقية استثنائية', 'أخرى') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2), -- For monetary rewards
    award_date DATE NOT NULL,
    reason TEXT NOT NULL,
    awarded_by BIGINT,
    status ENUM('مقترح', 'معتمد', 'مرفوض', 'مطبق') DEFAULT 'مقترح',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_award_date (award_date),
    INDEX idx_type (reward_type)
);
```

### 8. Leave Requests Table
```sql
CREATE TABLE leave_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    leave_type ENUM('إجازة سنوية', 'إجازة مرضية', 'إجازة أمومة', 'إجازة أبوة', 'إجازة بدون راتب', 'إجازة طارئة') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1),
    reason TEXT,
    replacement_employee_id BIGINT,
    manager_notes TEXT,
    hr_notes TEXT,
    approved_by BIGINT,
    approval_date DATE,
    status ENUM('معلق', 'معتمد', 'مرفوض', 'ملغي') DEFAULT 'معلق',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (replacement_employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status),
    INDEX idx_type (leave_type)
);
```

### 9. Absence Records Table
```sql
CREATE TABLE absence_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    absence_date DATE NOT NULL,
    absence_type ENUM('غياب بعذر', 'غياب بدون عذر', 'تأخير', 'انصراف مبكر') NOT NULL,
    hours_missed DECIMAL(4,2) DEFAULT 0, -- For partial day absences
    reason TEXT,
    excuse_provided BOOLEAN DEFAULT FALSE,
    manager_notes TEXT,
    hr_notes TEXT,
    approved BOOLEAN DEFAULT FALSE,
    approved_by BIGINT,
    approval_date DATE,
    deduction_amount DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_date (absence_date),
    INDEX idx_type (absence_type),
    UNIQUE KEY unique_employee_date (employee_id, absence_date)
);
```

### 10. Salary Records Table
```sql
CREATE TABLE salary_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    pay_period VARCHAR(20) NOT NULL, -- e.g., '2023-12', 'Q4-2023'
    pay_date DATE NOT NULL,
    
    -- Salary Components
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    housing_allowance DECIMAL(10,2) DEFAULT 0,
    transport_allowance DECIMAL(10,2) DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    overtime_rate DECIMAL(8,2) DEFAULT 0,
    overtime_amount DECIMAL(10,2) GENERATED ALWAYS AS (overtime_hours * overtime_rate),
    bonus DECIMAL(10,2) DEFAULT 0,
    
    -- Deductions
    insurance_deduction DECIMAL(10,2) DEFAULT 0,
    loan_deduction DECIMAL(10,2) DEFAULT 0,
    advance_deduction DECIMAL(10,2) DEFAULT 0,
    absence_deduction DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    
    -- Calculations
    gross_salary DECIMAL(10,2) GENERATED ALWAYS AS (
        basic_salary + allowances + housing_allowance + transport_allowance + overtime_amount + bonus
    ),
    total_deductions DECIMAL(10,2) GENERATED ALWAYS AS (
        insurance_deduction + loan_deduction + advance_deduction + absence_deduction + other_deductions
    ),
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (
        basic_salary + allowances + housing_allowance + transport_allowance + overtime_amount + bonus -
        insurance_deduction - loan_deduction - advance_deduction - absence_deduction - other_deductions
    ),
    
    status ENUM('مسودة', 'معتمد', 'مدفوع') DEFAULT 'مسودة',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_period (pay_period),
    INDEX idx_pay_date (pay_date),
    UNIQUE KEY unique_employee_period (employee_id, pay_period)
);
```

### 11. Service Years Table
```sql
CREATE TABLE service_years (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    calculation_date DATE NOT NULL,
    years_of_service INT NOT NULL,
    months_of_service INT NOT NULL,
    days_of_service INT NOT NULL,
    total_days INT NOT NULL,
    service_bonus DECIMAL(10,2) DEFAULT 0,
    retirement_eligible BOOLEAN DEFAULT FALSE,
    next_milestone_years INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_calculation_date (calculation_date),
    INDEX idx_years (years_of_service)
);
```

### 12. Reports Table
```sql
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('موظفين', 'دورات', 'تقييمات', 'ترقيات', 'مكافآت', 'إجازات', 'غياب', 'رواتب', 'سنوات خدمة') NOT NULL,
    parameters JSON, -- Store report parameters as JSON
    generated_by BIGINT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    status ENUM('جاري', 'مكتمل', 'فشل') DEFAULT 'جاري',
    
    FOREIGN KEY (generated_by) REFERENCES employees(id),
    INDEX idx_type (report_type),
    INDEX idx_generated_by (generated_by),
    INDEX idx_status (status)
);
```

## Attachment Relationships

### Each module can have multiple attachment types:

#### Employees
- `personalPhoto`: صورة شخصية
- `documents`: وثائق شخصية
- `contracts`: عقود العمل
- `certifications`: شهادات

#### Courses
- `certificate`: شهادة الدورة
- `materials`: مواد التدريب
- `evaluation`: تقييم الدورة

#### Evaluations
- `evaluationReport`: تقرير التقييم
- `supportingDocuments`: مستندات داعمة
- `goals`: ملف الأهداف

#### Promotions
- `promotionLetter`: خطاب الترقية
- `approvalDocuments`: مستندات الموافقة
- `justification`: مبررات الترقية

#### Rewards
- `rewardCertificate`: شهادة المكافأة
- `approvalDocument`: مستند الموافقة
- `photos`: صور الحفل

#### Leave Requests
- `medicalReport`: تقرير طبي
- `leaveRequest`: طلب الإجازة
- `approvalDocument`: مستند الموافقة

#### Absence Records
- `excuse`: عذر الغياب
- `medicalCertificate`: شهادة طبية
- `explanation`: خطاب توضيح

#### Salary Records
- `paySlip`: قسيمة الراتب
- `bankTransfer`: إشعار التحويل
- `taxDocuments`: مستندات ضريبية

## Database Views for Common Queries

### Employee Summary View
```sql
CREATE VIEW employee_summary AS
SELECT 
    e.id,
    e.employee_number,
    e.name,
    e.position,
    e.department,
    e.status,
    e.total_salary,
    TIMESTAMPDIFF(YEAR, e.hire_date, CURDATE()) as years_of_service,
    (SELECT COUNT(*) FROM courses c WHERE c.employee_id = e.id AND c.status = 'مكتمل') as completed_courses,
    (SELECT AVG(ev.overall_score) FROM evaluations ev WHERE ev.employee_id = e.id) as avg_evaluation_score,
    (SELECT COUNT(*) FROM leave_requests lr WHERE lr.employee_id = e.id AND lr.status = 'معتمد') as approved_leaves
FROM employees e;
```

### Training Summary View
```sql
CREATE VIEW training_summary AS
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.department,
    COUNT(c.id) as total_courses,
    COUNT(CASE WHEN c.status = 'مكتمل' THEN 1 END) as completed_courses,
    SUM(c.cost) as total_training_cost,
    AVG(c.grade) as average_grade
FROM employees e
LEFT JOIN courses c ON e.id = c.employee_id
GROUP BY e.id;
```

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_employee_status_dept ON employees(status, department);
CREATE INDEX idx_course_employee_status ON courses(employee_id, status);
CREATE INDEX idx_evaluation_employee_period ON evaluations(employee_id, evaluation_period);
CREATE INDEX idx_leave_employee_dates ON leave_requests(employee_id, start_date, end_date);
CREATE INDEX idx_salary_employee_period ON salary_records(employee_id, pay_period);

-- Full-text search indexes
CREATE FULLTEXT INDEX ft_employee_search ON employees(name, position, department);
CREATE FULLTEXT INDEX ft_course_search ON courses(course_name, provider, description);
```

## Data Integrity Constraints

```sql
-- Ensure evaluation scores are within valid range
ALTER TABLE evaluations ADD CONSTRAINT chk_score_range CHECK (overall_score >= 0 AND overall_score <= 5);
ALTER TABLE evaluation_criteria ADD CONSTRAINT chk_criteria_score_range CHECK (score >= 0 AND score <= 5);

-- Ensure dates are logical
ALTER TABLE courses ADD CONSTRAINT chk_course_dates CHECK (end_date >= start_date);
ALTER TABLE leave_requests ADD CONSTRAINT chk_leave_dates CHECK (end_date >= start_date);
ALTER TABLE promotions ADD CONSTRAINT chk_promotion_salary CHECK (to_salary > 0);

-- Ensure file sizes are reasonable (max 100MB)
ALTER TABLE attachments ADD CONSTRAINT chk_file_size CHECK (file_size <= 104857600);
```

This comprehensive schema supports:
- ✅ Full CRUD operations for all modules
- ✅ Attachment functionality across all entities
- ✅ Professional validation and constraints
- ✅ Optimized performance with proper indexing
- ✅ Data integrity and business rules
- ✅ Scalable design for enterprise use