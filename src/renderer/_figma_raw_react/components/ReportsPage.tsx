import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Download, Printer, Eye, Calendar, Users, DollarSign, BookOpen } from 'lucide-react';

const reportTypes = [
  {
    id: 'salary',
    name: 'تقرير الرواتب',
    icon: DollarSign,
    description: 'تقرير شامل عن رواتب الموظفين',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'attendance',
    name: 'تقرير الحضور والغياب',
    icon: Calendar,
    description: 'تقرير حضور وغياب الموظفين',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'leave',
    name: 'تقرير الإجازات',
    icon: Users,
    description: 'تقرير إجازات الموظفين المعتمدة',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'evaluation',
    name: 'تقرير التقييمات',
    icon: BookOpen,
    description: 'تقرير تقييمات أداء الموظفين',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const mockSalaryReport = [
  { employeeNumber: 'EMP001', name: 'أحمد محمد علي', department: 'تقنية المعلومات', gross: 23500, deductions: 700, net: 22800 },
  { employeeNumber: 'EMP002', name: 'فاطمة عبد الله', department: 'المالية', gross: 18500, deductions: 500, net: 18000 },
  { employeeNumber: 'EMP003', name: 'خالد عبد الرحمن', department: 'العمليات', gross: 25000, deductions: 800, net: 24200 }
];

const mockAttendanceReport = [
  { employeeNumber: 'EMP001', name: 'أحمد محمد علي', workingDays: 22, present: 21, absent: 1, attendanceRate: 95.5 },
  { employeeNumber: 'EMP002', name: 'فاطمة عبد الله', workingDays: 22, present: 20, absent: 2, attendanceRate: 90.9 },
  { employeeNumber: 'EMP003', name: 'خالد عبد الرحمن', workingDays: 22, present: 22, absent: 0, attendanceRate: 100 }
];

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('salary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportData, setReportData] = useState(null);

  const generateReport = () => {
    // Mock report generation
    if (selectedReport === 'salary') {
      setReportData(mockSalaryReport);
    } else if (selectedReport === 'attendance') {
      setReportData(mockAttendanceReport);
    } else {
      setReportData([]);
    }
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    // Mock Excel export
    alert('سيتم تنزيل التقرير كملف Excel');
  };

  const exportToPDF = () => {
    // Mock PDF export
    alert('سيتم تنزيل التقرير كملف PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">التقارير</h1>
        <div className="flex space-x-reverse space-x-2">
          <Button variant="outline" onClick={printReport}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 ml-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التقرير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نوع التقرير</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>القسم</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    <SelectItem value="it">تقنية المعلومات</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                    <SelectItem value="operations">العمليات</SelectItem>
                    <SelectItem value="hr">الموارد البشرية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={generateReport} className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 ml-2" />
                إنشاء التقرير
              </Button>
            </CardContent>
          </Card>

          {/* Report Types */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع التقارير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div 
                      key={type.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport === type.id ? type.bgColor : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(type.id)}
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {reportTypes.find(r => r.id === selectedReport)?.name || 'التقرير'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-4">
                  {/* Report Header */}
                  <div className="text-center py-4 border-b print:border-b-2">
                    <h2 className="text-xl font-bold">نظام إدارة الموظفين</h2>
                    <h3 className="text-lg font-semibold mt-2">
                      {reportTypes.find(r => r.id === selectedReport)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}
                    </p>
                    {dateFrom && dateTo && (
                      <p className="text-sm text-gray-600">
                        الفترة: من {new Date(dateFrom).toLocaleDateString('ar-SA')} إلى {new Date(dateTo).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>

                  {/* Salary Report */}
                  {selectedReport === 'salary' && (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">رقم الموظف</TableHead>
                            <TableHead className="text-right">اسم الموظف</TableHead>
                            <TableHead className="text-right">القسم</TableHead>
                            <TableHead className="text-right">الراتب الإجمالي</TableHead>
                            <TableHead className="text-right">الخصومات</TableHead>
                            <TableHead className="text-right">الراتب الصافي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.employeeNumber}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.department}</TableCell>
                              <TableCell className="text-green-600 font-semibold">
                                {row.gross?.toLocaleString()} ريال
                              </TableCell>
                              <TableCell className="text-red-600">
                                {row.deductions?.toLocaleString()} ريال
                              </TableCell>
                              <TableCell className="text-blue-600 font-semibold">
                                {row.net?.toLocaleString()} ريال
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">إجمالي الرواتب الإجمالية</p>
                            <p className="text-lg font-semibold text-green-600">
                              {reportData.reduce((sum, row) => sum + row.gross, 0).toLocaleString()} ريال
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">إجمالي الخصومات</p>
                            <p className="text-lg font-semibold text-red-600">
                              {reportData.reduce((sum, row) => sum + row.deductions, 0).toLocaleString()} ريال
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">إجمالي الرواتب الصافية</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {reportData.reduce((sum, row) => sum + row.net, 0).toLocaleString()} ريال
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendance Report */}
                  {selectedReport === 'attendance' && (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">رقم الموظف</TableHead>
                            <TableHead className="text-right">اسم الموظف</TableHead>
                            <TableHead className="text-right">أيام العمل</TableHead>
                            <TableHead className="text-right">أيام الحضور</TableHead>
                            <TableHead className="text-right">أيام الغياب</TableHead>
                            <TableHead className="text-right">نسبة الحضور</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.employeeNumber}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.workingDays}</TableCell>
                              <TableCell className="text-green-600 font-semibold">{row.present}</TableCell>
                              <TableCell className="text-red-600 font-semibold">{row.absent}</TableCell>
                              <TableCell className="text-blue-600 font-semibold">{row.attendanceRate}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">متوسط نسبة الحضور العام</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {(reportData.reduce((sum, row) => sum + row.attendanceRate, 0) / reportData.length).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">اختر إعدادات التقرير واضغط "إنشاء التقرير"</p>
                  <p className="text-sm">سيتم عرض النتائج هنا</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}