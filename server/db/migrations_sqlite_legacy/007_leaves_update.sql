-- Create leaves table for employee leave management
CREATE TABLE IF NOT EXISTS leaves (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,         -- سنوية | مرضية | طارئة | بدون راتب | أمومة | أبوة | أخرى
  reason TEXT,
  start_date TEXT NOT NULL,         -- format YYYY-MM-DD
  end_date TEXT NOT NULL,
  days_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'في الانتظار',  -- في الانتظار | معتمد | مرفوض
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status   ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_type     ON leaves(leave_type);
CREATE INDEX IF NOT EXISTS idx_leaves_dates    ON leaves(start_date, end_date);
