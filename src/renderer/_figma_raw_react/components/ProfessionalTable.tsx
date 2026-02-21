import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface TableColumn {
  key: string;
  label: string;
  width: string;
  align?: 'right' | 'center' | 'left';
  render?: (value: any, row: any) => React.ReactNode;
}

interface ProfessionalTableProps {
  columns: TableColumn[];
  data: any[];
  className?: string;
}

export function ProfessionalTable({ columns, data, className = '' }: ProfessionalTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-medium',
      'إجازة': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm font-medium',
      'متقاعد': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm font-medium',
      'مكتملة': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-medium',
      'معتمدة': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-sm font-medium',
      'قيد المراجعة': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm font-medium',
      'ممتاز': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-medium',
      'جيد جداً': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-sm font-medium',
      'جيد': 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm font-medium'
    };
    return variants[status] || 'inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm font-medium';
  };

  const renderCellContent = (column: TableColumn, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }

    // Handle special cell types
    if (column.key === 'photo' || column.key === 'avatar') {
      return (
        <div className="flex justify-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.photo || row.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {row.name?.split(' ')[0][0] || '؟'}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    }

    if (column.key === 'status' || column.key === 'حالة' || column.key.includes('status')) {
      return (
        <div className="flex justify-center">
          <span className={getStatusBadge(value)}>{value}</span>
        </div>
      );
    }

    if (column.key === 'actions' || column.key === 'الإجراءات') {
      return (
        <div className="flex items-center justify-center space-x-reverse space-x-1">
          {value}
        </div>
      );
    }

    // Handle dates
    if (column.key.includes('date') || column.key.includes('Date') || column.key.includes('تاريخ')) {
      if (value) {
        return new Date(value).toLocaleDateString('ar-SA');
      }
    }

    // Handle numbers with Arabic locale
    if (typeof value === 'number') {
      return value.toLocaleString('ar-SA');
    }

    return value || '-';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F5F6FA] border-b border-[#E0E0E0]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-right px-6 py-4 font-medium text-gray-900"
                  style={{ 
                    width: column.width,
                    minWidth: column.width,
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: column.align || 'right'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-12 text-gray-500 bg-gray-50"
                  style={{ fontSize: '14px' }}
                >
                  لا توجد بيانات للعرض
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                // Extract data attributes from row
                const dataAttributes = {};
                Object.keys(row).forEach(key => {
                  if (key.startsWith('data-')) {
                    dataAttributes[key] = row[key];
                  }
                });

                return (
                  <tr
                    key={row.id || index}
                    className="border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors duration-150"
                    style={{ minHeight: '56px' }}
                    {...dataAttributes}
                  >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 align-middle"
                      style={{
                        width: column.width,
                        minWidth: column.width,
                        fontSize: '14px',
                        fontWeight: 400,
                        textAlign: column.align || 'right',
                        height: '56px'
                      }}
                    >
                      {renderCellContent(column, row)}
                    </td>
                  ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to create action buttons with consistent styling
export function createActionButtons(actions: Array<{
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}>) {
  return (
    <div className="flex items-center justify-center space-x-reverse space-x-1">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          title={action.title}
          className={`p-2 h-8 w-8 hover:bg-gray-100 transition-colors ${action.className || ''}`}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}