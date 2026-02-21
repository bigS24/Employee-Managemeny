import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BookOpen, TrendingUp, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { DualCurrencyDisplay } from './DualCurrencyDisplay';
import { useCurrency, formatUSD, formatTRY, currencyService } from './CurrencyService';

const statsData = [
  { title: 'إجمالي الموظفين', value: '1,247', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', type: 'text' },
  { title: 'الدورات المكتملة', value: '324', icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-50', type: 'text' },
  { title: 'الترقيات الشهرية', value: '18', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', type: 'text' },
  { title: 'إجمالي الرواتب', value: 65700, icon: DollarSign, color: 'text-orange-600', bgColor: 'bg-orange-50', type: 'currency' },
  { title: 'الإجازات المعتمدة', value: '89', icon: Calendar, color: 'text-indigo-600', bgColor: 'bg-indigo-50', type: 'text' },
  { title: 'معدل الحضور', value: '94.2%', icon: UserCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50', type: 'text' },
];

const departmentData = [
  { name: 'تقنية المعلومات', employees: 145, color: '#3B82F6' },
  { name: 'الموارد البشرية', employees: 89, color: '#10B981' },
  { name: 'المالية', employees: 124, color: '#F59E0B' },
  { name: 'التسويق', employees: 98, color: '#EF4444' },
  { name: 'العمليات', employees: 156, color: '#8B5CF6' },
];

const salaryTrendData = [
  { month: 'يناير', amount: 60300 },
  { month: 'فبراير', amount: 64400 },
  { month: 'مارس', amount: 65700 },
  { month: 'أبريل', amount: 63000 },
  { month: 'مايو', amount: 67100 },
  { month: 'يونيو', amount: 68500 },
];

const attendanceData = [
  { day: 'السبت', present: 1180, absent: 67 },
  { day: 'الأحد', present: 1195, absent: 52 },
  { day: 'الاثنين', present: 1205, absent: 42 },
  { day: 'الثلاثاء', present: 1190, absent: 57 },
  { day: 'الأربعاء', present: 1175, absent: 72 },
];

export function Dashboard() {
  const { displayCurrency, activeRate } = useCurrency();
  
  // Custom tooltip formatter for salary chart
  const formatSalaryTooltip = (value: number) => {
    if (displayCurrency === 'USD') {
      return [formatUSD(value), 'المبلغ'];
    } else {
      const tryAmount = currencyService.convertUsdToTry(value, activeRate?.rate);
      return [formatTRY(tryAmount), 'المبلغ'];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">لوحة التحكم</h1>
        <div className="text-sm text-gray-500">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    {stat.type === 'currency' ? (
                      <DualCurrencyDisplay 
                        amountUSD={stat.value as number} 
                        size="lg"
                        showTooltip={false}
                        className=""
                      />
                    ) : (
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="employees"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salary Trends */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه الرواتب الشهرية ({displayCurrency})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salaryTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={formatSalaryTooltip} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>معدل الحضور الأسبوعي</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" name="حاضر" />
              <Bar dataKey="absent" fill="#EF4444" name="غائب" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>آخر الأنشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-reverse space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">تم إضافة موظف جديد: سارة أحمد</p>
                <p className="text-xs text-gray-500">منذ ساعتين</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">تم اعتماد إجازة: خالد محمد</p>
                <p className="text-xs text-gray-500">منذ 4 ساعات</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">تم تقييم موظف: فاطمة علي - ممتاز</p>
                <p className="text-xs text-gray-500">أمس</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}