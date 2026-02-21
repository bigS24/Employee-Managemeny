
USE master;
GO

-- Create Login if not exists
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'EmployeeAppUser')
BEGIN
    CREATE LOGIN EmployeeAppUser WITH PASSWORD = 'Employee@2025!', CHECK_POLICY = OFF;
    PRINT 'Login EmployeeAppUser created.';
END
ELSE
BEGIN
    -- Reset password to ensure we know it
    ALTER LOGIN EmployeeAppUser WITH PASSWORD = 'Employee@2025!';
    PRINT 'Login EmployeeAppUser password reset.';
END
GO

-- Create Database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EmployeeManagement')
BEGIN
    CREATE DATABASE EmployeeManagement;
    PRINT 'Database EmployeeManagement created.';
END
GO

USE EmployeeManagement;
GO

-- Create User in Database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'EmployeeAppUser')
BEGIN
    CREATE USER EmployeeAppUser FOR LOGIN EmployeeAppUser;
    PRINT 'User EmployeeAppUser created in database.';
END
GO

-- Add to db_owner role
ALTER ROLE db_owner ADD MEMBER EmployeeAppUser;
PRINT 'User EmployeeAppUser added to db_owner role.';
GO
