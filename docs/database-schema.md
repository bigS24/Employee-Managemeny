# مخطط قاعدة البيانات - نظام إدارة الموظفين

## نظرة عامة
هذا المخطط يدعم نظام إدارة الموظفين الشامل مع جميع الوظائف المطلوبة بما في ذلك إدارة البيانات الأساسية، الرواتب، الدورات، التقييمات، الترقيات، المكافآت، الإجازات، الغياب، وسنوات الخدمة.

## الجداول الأساسية

### 1. جدول الموظفين (employees)
```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department_id INT,
    hire_date DATE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    photo_url VARCHAR(255),
    status ENUM('نشط', 'إجازة', 'متقاعد', 'مستقيل') DEFAULT 'نشط',
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

### 2. جدول الأقسام (departments)
```sql
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    manager_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);
```

### 3. جدول تصنيفات الرواتب (salary_categories)
```sql
CREATE TABLE salary_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    min_salary DECIMAL(10,2) NOT NULL,
    admin_level_allowance DECIMAL(10,2) NOT NULL,
    qualification_allowance DECIMAL(10,2) NOT NULL,
    experience_allowance_per_year DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إدراج البيانات الثابتة لتصنيفات الرواتب
INSERT INTO salary_categories VALUES
(1, 'الدرجة الأولى', 15000.00, 5000.00, 2000.00, 300.00, NOW()),
(2, 'الدرجة الثانية', 12000.00, 3000.00, 1500.00, 250.00, NOW()),
(3, 'الدرجة الثالثة', 10000.00, 2000.00, 1000.00, 200.00, NOW()),
(4, 'الدرجة الرابعة', 8000.00, 1500.00, 800.00, 150.00, NOW());
```

## جداول الرواتب

### 4. جدول رواتب الموظفين (employee_salaries)
```sql
CREATE TABLE employee_salaries (
    salary_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    category_id INT NOT NULL,
    experience_years INT DEFAULT 0,
    additional_amount DECIMAL(10,2) DEFAULT 0,
    
    -- الراتب الإجمالي (محسوب)
    gross_salary DECIMAL(10,2) GENERATED ALWAYS AS (
        (SELECT min_salary + admin_level_allowance + qualification_allowance + 
         (experience_allowance_per_year * experience_years) + additional_amount
         FROM salary_categories WHERE category_id = employee_salaries.category_id)
    ) STORED,
    
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (category_id) REFERENCES salary_categories(category_id)
);
```

### 5. جدول كشوف الرواتب الشهرية (monthly_payrolls)
```sql
CREATE TABLE monthly_payrolls (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    year_month VARCHAR(7) NOT NULL, -- تنسيق: YYYY-MM
    gross_salary DECIMAL(10,2) NOT NULL,
    
    -- الخصومات
    advances DECIMAL(10,2) DEFAULT 0,
    loans DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) GENERATED ALWAYS AS (advances + loans + other_deductions) STORED,
    
    -- الراتب الصافي
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (gross_salary - total_deductions) STORED,
    
    payment_date DATE,
    status ENUM('معلق', 'مدفوع', 'ملغي') DEFAULT 'معلق',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    UNIQUE KEY unique_employee_month (employee_id, year_month)
);
```

## جداول الدورات والتدريب

### 6. جدول الدورات التدريبية (training_courses)
```sql
CREATE TABLE training_courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_hours INT NOT NULL,
    result ENUM('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'راسب') NOT NULL,
    grade DECIMAL(5,2), -- الدرجة من 0 إلى 100
    has_certificate BOOLEAN DEFAULT FALSE,
    cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول التقييمات

### 7. جدول تقييمات الأداء (performance_evaluations)
```sql
CREATE TABLE performance_evaluations (
    evaluation_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    evaluator_name VARCHAR(100) NOT NULL,
    evaluation_date DATE NOT NULL,
    evaluation_period VARCHAR(50) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    
    -- التقدير المحسوب بناءً على الدرجة
    grade VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN score >= 90 THEN 'ممتاز'
            WHEN score >= 80 THEN 'جيد جداً'
            WHEN score >= 70 THEN 'جيد'
            WHEN score >= 60 THEN 'مقبول'
            ELSE 'ضعيف'
        END
    ) STORED,
    
    strengths TEXT,
    improvement_areas TEXT,
    future_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول الترقيات

### 8. جدول الترقيات (promotions)
```sql
CREATE TABLE promotions (
    promotion_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    promotion_type ENUM('ترقية منصب', 'ترقية درجة', 'زيادة راتب') NOT NULL,
    from_position VARCHAR(100),
    to_position VARCHAR(100),
    from_salary DECIMAL(10,2),
    to_salary DECIMAL(10,2),
    
    -- حساب نسبة الزيادة
    salary_increase_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN from_salary > 0 THEN ((to_salary - from_salary) / from_salary * 100)
            ELSE 0
        END
    ) STORED,
    
    effective_date DATE NOT NULL,
    reason TEXT NOT NULL,
    approver VARCHAR(100) NOT NULL,
    status ENUM('معتمدة', 'مرفوضة', 'قيد المراجعة') DEFAULT 'قيد المراجعة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول المكافآت

### 9. جدول المكافآت (rewards)
```sql
CREATE TABLE rewards (
    reward_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    reward_type ENUM('مكافأة مالية', 'شهادة تقدير', 'هدية عينية') NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0,
    reason TEXT NOT NULL,
    reward_date DATE NOT NULL,
    approver VARCHAR(100) NOT NULL,
    reference_number VARCHAR(50) UNIQUE,
    status ENUM('معتمدة', 'مرفوضة', 'قيد المراجعة') DEFAULT 'قيد المراجعة',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول الإجازات

### 10. جدول أنواع الإجازات (leave_types)
```sql
CREATE TABLE leave_types (
    leave_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL,
    max_days_per_year INT DEFAULT 0, -- 0 للإجازات الساعية
    is_paid BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- إدراج أنواع الإجازات
INSERT INTO leave_types VALUES
(1, 'إجازة سنوية', 30, TRUE, TRUE, 'الإجازة السنوية المدفوعة'),
(2, 'إجازة طارئة', 7, TRUE, TRUE, 'إجازة للحالات الطارئة'),
(3, 'إجازة مرضية', 15, TRUE, FALSE, 'إجازة مرضية بتقرير طبي'),
(4, 'إجازة ساعية', 0, TRUE, TRUE, 'إجازة بالساعات');
```

### 11. جدول طلبات الإجازات (leave_requests)
```sql
CREATE TABLE leave_requests (
    leave_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    hours INT DEFAULT 0, -- للإجازات الساعية
    
    -- حساب عدد الأيام تلقائياً
    total_days INT GENERATED ALWAYS AS (
        CASE 
            WHEN hours > 0 THEN 0
            WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
            THEN DATEDIFF(end_date, start_date) + 1
            ELSE 0
        END
    ) STORED,
    
    reason TEXT NOT NULL,
    status ENUM('معتمدة', 'مرفوضة', 'قيد المراجعة') DEFAULT 'قيد المراجعة',
    approver VARCHAR(100),
    request_date DATE DEFAULT (CURRENT_DATE),
    approval_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
);
```

## جداول الغياب

### 12. جدول سجل الغياب (absence_records)
```sql
CREATE TABLE absence_records (
    absence_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    absence_type ENUM('غياب غير مبرر', 'غياب مرضي', 'غياب طارئ', 'تأخير') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    hours DECIMAL(4,2) DEFAULT 0, -- للتأخير بالساعات
    
    -- حساب عدد الأيام
    total_days INT GENERATED ALWAYS AS (
        CASE 
            WHEN absence_type = 'تأخير' THEN 0
            ELSE DATEDIFF(to_date, from_date) + 1
        END
    ) STORED,
    
    reason TEXT,
    status ENUM('مبرر', 'غير مبرر', 'قيد المراجعة') DEFAULT 'قيد المراجعة',
    reported_by ENUM('الموظف', 'المدير المباشر', 'الموارد البشرية') NOT NULL,
    report_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول سنوات الخدمة

### 13. جدول سجل سنوات الخدمة (service_records)
```sql
CREATE TABLE service_records (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL, -- NULL للموظفين النشطين
    position_during_period VARCHAR(100),
    
    -- حساب سنوات الخدمة
    service_years INT GENERATED ALWAYS AS (
        FLOOR(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) / 365)
    ) STORED,
    
    service_months INT GENERATED ALWAYS AS (
        FLOOR((DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) % 365) / 30)
    ) STORED,
    
    service_days INT GENERATED ALWAYS AS (
        DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) % 30
    ) STORED,
    
    total_service_days INT GENERATED ALWAYS AS (
        DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date)
    ) STORED,
    
    -- تحديد فئة الخدمة
    service_category VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN FLOOR(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) / 365) >= 20 THEN 'خبير'
            WHEN FLOOR(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) / 365) >= 10 THEN 'موظف مخضرم'
            WHEN FLOOR(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) / 365) >= 5 THEN 'موظف أقدم'
            WHEN FLOOR(DATEDIFF(COALESCE(end_date, CURRENT_DATE), start_date) / 365) >= 1 THEN 'موظف'
            ELSE 'موظف جديد'
        END
    ) STORED,
    
    status ENUM('نشط', 'متقاعد', 'مستقيل') DEFAULT 'نشط',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

## جداول النظام والتدقيق

### 14. جدول المرفقات (attachments)
```sql
CREATE TABLE attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    category ENUM('صورة شخصية', 'مستند هوية', 'شهادة', 'عقد عمل', 'أخرى') DEFAULT 'أخرى',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### 15. جدول سجل العمليات (audit_log)
```sql
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_name VARCHAR(100),
    operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## الفهارس والقيود

### الفهارس الأساسية
```sql
-- فهارس الأداء
CREATE INDEX idx_employee_number ON employees(employee_number);
CREATE INDEX idx_employee_department ON employees(department_id);
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_payroll_month ON monthly_payrolls(year_month);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_absence_dates ON absence_records(from_date, to_date);
CREATE INDEX idx_service_dates ON service_records(start_date, end_date);

-- فهارس مركبة للاستعلامات المعقدة
CREATE INDEX idx_employee_active_salary ON employee_salaries(employee_id, is_active);
CREATE INDEX idx_evaluation_employee_date ON performance_evaluations(employee_id, evaluation_date);
```

### قيود إضافية
```sql
-- التأكد من صحة البيانات
ALTER TABLE employees ADD CONSTRAINT chk_hire_date CHECK (hire_date <= CURRENT_DATE);
ALTER TABLE monthly_payrolls ADD CONSTRAINT chk_gross_salary CHECK (gross_salary >= 0);
ALTER TABLE performance_evaluations ADD CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= 100);
ALTER TABLE leave_requests ADD CONSTRAINT chk_leave_dates CHECK (start_date <= end_date OR hours > 0);
```

## Views للتقارير

### 1. عرض بيانات الموظفين الشاملة
```sql
CREATE VIEW employee_summary AS
SELECT 
    e.employee_id,
    e.employee_number,
    e.full_name,
    e.position,
    d.department_name,
    e.hire_date,
    e.status,
    es.gross_salary,
    sr.service_years,
    sr.service_category,
    (SELECT AVG(pe.score) FROM performance_evaluations pe WHERE pe.employee_id = e.employee_id) as avg_evaluation_score
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN employee_salaries es ON e.employee_id = es.employee_id AND es.is_active = TRUE
LEFT JOIN service_records sr ON e.employee_id = sr.employee_id AND sr.status = 'نشط';
```

### 2. عرض إحصائيات الرواتب الشهرية
```sql
CREATE VIEW monthly_salary_stats AS
SELECT 
    year_month,
    COUNT(*) as total_employees,
    SUM(gross_salary) as total_gross,
    SUM(total_deductions) as total_deductions,
    SUM(net_salary) as total_net,
    AVG(net_salary) as avg_net_salary
FROM monthly_payrolls
WHERE status = 'مدفوع'
GROUP BY year_month;
```

### 3. عرض إحصائيات الحضور والغياب
```sql
CREATE VIEW attendance_stats AS
SELECT 
    e.employee_id,
    e.employee_number,
    e.full_name,
    COUNT(ar.absence_id) as total_absences,
    SUM(ar.total_days) as total_absent_days,
    SUM(CASE WHEN ar.status = 'غير مبرر' THEN ar.total_days ELSE 0 END) as unjustified_days
FROM employees e
LEFT JOIN absence_records ar ON e.employee_id = ar.employee_id 
    AND ar.from_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
WHERE e.status = 'نشط'
GROUP BY e.employee_id, e.employee_number, e.full_name;
```

## إجراءات مخزنة

### 1. حساب الراتب الإجمالي
```sql
DELIMITER //
CREATE PROCEDURE calculate_gross_salary(
    IN emp_id INT,
    IN category_id INT,
    IN experience_years INT,
    IN additional_amount DECIMAL(10,2),
    OUT gross_salary DECIMAL(10,2)
)
BEGIN
    SELECT 
        min_salary + admin_level_allowance + qualification_allowance + 
        (experience_allowance_per_year * experience_years) + additional_amount
    INTO gross_salary
    FROM salary_categories 
    WHERE category_id = category_id;
END //
DELIMITER ;
```

### 2. تحديث إحصائيات الموظف
```sql
DELIMITER //
CREATE PROCEDURE update_employee_stats(IN emp_id INT)
BEGIN
    -- تحديث متوسط التقييمات
    UPDATE employees e
    SET e.avg_evaluation = (
        SELECT AVG(pe.score) 
        FROM performance_evaluations pe 
        WHERE pe.employee_id = emp_id
    )
    WHERE e.employee_id = emp_id;
    
    -- تحديث إجمالي الدورات
    UPDATE employees e
    SET e.total_courses = (
        SELECT COUNT(*) 
        FROM training_courses tc 
        WHERE tc.employee_id = emp_id
    )
    WHERE e.employee_id = emp_id;
END //
DELIMITER ;
```

## ملاحظات مهمة

### الأمان والحماية
1. **تشفير البيانات الحساسة**: يجب تشفير أرقام الحسابات البنكية وأرقام الهوية
2. **صلاحيات المستخدمين**: تطبيق نظام صلاحيات متدرج حسب الأدوار
3. **نسخ احتياطية**: جدولة نسخ احتياطية يومية للبيانات الحرجة

### الأداء والصيانة
1. **الفهرسة**: مراجعة وتحسين الفهارس بناءً على أنماط الاستعلام
2. **الأرشفة**: أرشفة البيانات القديمة (أكثر من 5 سنوات) لتحسين الأداء
3. **المراقبة**: مراقبة أداء الاستعلامات وتحسينها

### التوافق والمعايير
1. **ترميز UTF-8**: لدعم النصوص العربية بشكل صحيح
2. **التاريخ والوقت**: استخدام المنطقة الزمنية المحلية
3. **العملة**: حفظ المبالغ بدقة عالية لتجنب أخطاء التقريب

هذا المخطط يوفر أساساً قوياً ومرناً لنظام إدارة الموظفين مع دعم جميع المتطلبات المحددة وإمكانية التوسع المستقبلي.