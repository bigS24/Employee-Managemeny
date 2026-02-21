import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EmployeesPage } from './components/EmployeesPageFixed';
import { EmployeeProfile } from './components/EmployeeProfile';
import { CoursesPage } from './components/CoursesPageNew';
import { EvaluationsPage } from './components/EvaluationsPageNew';
import { PromotionsPage } from './components/PromotionsPage';
import { RewardsPage } from './components/RewardsPage';
import { LeavePage } from './components/LeavePage';
import { AbsencePage } from './components/AbsencePage';
import { SalariesPage } from './components/SalariesPage';
import { ServiceYearsPage } from './components/ServiceYearsPage';
import { ExchangeRatesPage } from './components/ExchangeRatesPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { CurrencyProvider } from './components/CurrencyService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  useEffect(() => {
    // Listen for DB connection failure from main process
    if ((window as any).electron?.onDbConnectionFailed) {
      (window as any).electron.onDbConnectionFailed((error: string) => {
        console.error('Database connection failed:', error);
        setCurrentPage('settings');
        // Show persistent error toast
        toast.error('فشل الاتصال بقاعدة البيانات', {
          description: 'تعذر الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات الخادم أدناه.',
          duration: 10000,
        });
      });
    }
  }, []);

  const handleViewEmployeeProfile = (employee: any) => {
    setSelectedEmployee(employee);
    setCurrentPage('employee-profile');
  };

  const handleBackToEmployees = () => {
    setSelectedEmployee(null);
    setCurrentPage('employees');
  };

  const handleExcelImportOpen = () => {
    setCurrentPage('employees');
    setIsExcelImportOpen(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return (
          <EmployeesPage 
            onViewProfile={handleViewEmployeeProfile}
            excelImportOpen={isExcelImportOpen}
            onExcelImportOpenChange={setIsExcelImportOpen}
          />
        );
      case 'employee-profile':
        return selectedEmployee ? (
          <EmployeeProfile 
            employee={selectedEmployee} 
            onBack={handleBackToEmployees} 
          />
        ) : <EmployeesPage onViewProfile={handleViewEmployeeProfile} />;
      case 'courses':
        return <CoursesPage />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'leave':
        return <LeavePage />;
      case 'absence':
        return <AbsencePage />;
      case 'salaries':
        return <SalariesPage />;
      case 'service-years':
        return <ServiceYearsPage />;
      case 'exchange-rates':
        return <ExchangeRatesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // Full page layout for employee profile
  if (currentPage === 'employee-profile' && selectedEmployee) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen bg-gray-50" dir="rtl">
          {renderCurrentPage()}
          <Toaster />
        </div>
      </CurrencyProvider>
    );
  }

  // Default layout with sidebar and header
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onExcelImport={handleExcelImportOpen}
        />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            {renderCurrentPage()}
          </main>
        </div>
        <Toaster />
      </div>
    </CurrencyProvider>
  );
}