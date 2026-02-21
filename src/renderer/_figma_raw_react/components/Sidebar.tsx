import React from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Gift, 
  Calendar, 
  UserX, 
  DollarSign, 
  Clock, 
  FileText,
  Home,
  Upload,
  Settings
} from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onExcelImport?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
  { id: 'employees', label: 'الموظفون', icon: Users },
  { id: 'courses', label: 'الدورات', icon: BookOpen },
  { id: 'evaluations', label: 'التقييمات', icon: BarChart3 },
  { id: 'promotions', label: 'الترقيات', icon: TrendingUp },
  { id: 'rewards', label: 'المكافآت', icon: Gift },
  { id: 'leave', label: 'الإجازات', icon: Calendar },
  { id: 'absence', label: 'الغياب', icon: UserX },
  { id: 'salaries', label: 'الرواتب', icon: DollarSign },
  { id: 'service-years', label: 'سنوات الخدمة', icon: Clock },
  { id: 'exchange-rates', label: 'أسعار الصرف', icon: DollarSign },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange, onExcelImport }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-reverse space-x-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">إدارة الموظفين</h1>
            <p className="text-sm text-gray-500">نظام متكامل</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-reverse space-x-3 px-3 py-2.5 rounded-lg transition-colors text-right",
                  currentPage === item.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* Excel Import Button - under الموظفون */}
          {onExcelImport && (
            <button
              onClick={onExcelImport}
              className="w-full flex items-center space-x-reverse space-x-3 px-3 py-2.5 rounded-lg transition-colors text-right text-gray-700 hover:bg-green-50 hover:text-green-700 mr-6"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">استيراد من Excel</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}