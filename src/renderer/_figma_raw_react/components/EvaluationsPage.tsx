import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Search, Plus, Edit, Star, TrendingUp } from 'lucide-react';

const evaluationGrades = [
  { id: 'excellent', name: 'ممتاز', min: 90, max: 100, color: 'bg-green-100 text-green-800' },
  { id: 'very-good', name: 'جيد جداً', min: 80, max: 89, color: 'bg-blue-100 text-blue-800' },
  { id: 'good', name: 'جيد', min: 70, max: 79, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'acceptable', name: 'مقبول', min: 60, max: 69, color: 'bg-orange-100 text-orange-800' },
  { id: 'poor', name: 'ضعيف', min: 0, max: 59, color: 'bg-red-100 text-red-800' }
];

const mockEvaluations = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    evaluator: 'مدير تقنية المعلومات',
    evaluationDate: '2024-01-15',
    period: '2023',
    score: 92,
    grade: 'ممتاز',
    strengths: 'مهارات تقنية عالية، التزام بالمواعيد',
    improvements: 'تطوير مهارات القيادة',
    goals: 'قيادة فريق تطوير جديد'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    evaluator: 'مدير المالية',
    evaluationDate: '2024-01-20',
    period: '2023',
    score: 85,
    grade: 'جيد جداً',
    strengths: 'دقة في العمل، تعامل ممتاز مع العملاء',
    improvements: 'تطوير مهارات الحاسوب',
    goals: 'الحصول على شهادة محاسبية متقدمة'
  }
];

export function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.employeeName.includes(searchTerm) ||
    evaluation.employeeNumber.includes(searchTerm) ||
    evaluation.evaluator.includes(searchTerm)
  );

  const getGradeBadge = (score: number) => {
    const grade = evaluationGrades.find(g => score >= g.min && score <= g.max);
    return grade?.color || 'bg-gray-100 text-gray-800';
  };

  const getGradeName = (score: number) => {
    const grade = evaluationGrades.find(g => score >= g.min && score <= g.max);
    return grade?.name || 'غير محدد';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">تقييمات الأداء</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة تقييم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تقييم أداء موظف</DialogTitle>
              <DialogDescription>
                قم بتقييم أداء الموظف وإدخال الدرجات والملاحظات
              </DialogDescription>
            </DialogHeader>
            <EvaluationForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {evaluationGrades.map((grade) => {
          const count = evaluations.filter(e => e.score >= grade.min && e.score <= grade.max).length;
          return (
            <Card key={grade.id}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${grade.color}`}>
                    {grade.name}
                  </div>
                  <p className="text-sm text-gray-600">{grade.min}-{grade.max}%</p>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالموظف، رقم الموظف، أو المقيم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب التقدير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقديرات</SelectItem>
                {evaluationGrades.map(grade => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>تقييمات الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">المقيم</TableHead>
                <TableHead className="text-right">تاريخ التقييم</TableHead>
                <TableHead className="text-right">فترة التقييم</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
                <TableHead className="text-right">التقدير</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.employeeNumber}</TableCell>
                  <TableCell>{evaluation.employeeName}</TableCell>
                  <TableCell>{evaluation.evaluator}</TableCell>
                  <TableCell>{new Date(evaluation.evaluationDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-reverse space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{evaluation.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getGradeBadge(evaluation.score)}>
                      {evaluation.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function EvaluationForm({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);

  const currentGrade = getGradeName(score);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اختيار الموظف</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="اختر الموظف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMP001">EMP001 - أحمد محمد علي</SelectItem>
              <SelectItem value="EMP002">EMP002 - فاطمة عبد الله</SelectItem>
              <SelectItem value="EMP003">EMP003 - خالد عبد الرحمن</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>المقيم</Label>
          <Input placeholder="اسم المقيم" />
        </div>
        <div className="space-y-2">
          <Label>تاريخ التقييم</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>فترة التقييم</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="Q1-2024">الربع الأول 2024</SelectItem>
              <SelectItem value="Q2-2024">الربع الثاني 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>درجة التقييم (0-100)</Label>
          <Input 
            type="number" 
            min="0" 
            max="100" 
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            placeholder="85" 
          />
          {score > 0 && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeBadge(score)}`}>
              {currentGrade} - {score}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>نقاط القوة</Label>
          <Textarea placeholder="اذكر نقاط القوة للموظف..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label>نقاط التحسين</Label>
          <Textarea placeholder="اذكر المجالات التي تحتاج للتحسين..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label>الأهداف المستقبلية</Label>
          <Textarea placeholder="اذكر الأهداف المطلوب تحقيقها..." rows={3} />
        </div>
      </div>

      <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">حفظ التقييم</Button>
      </div>
    </div>
  );
}

function getGradeName(score: number) {
  const grade = evaluationGrades.find(g => score >= g.min && score <= g.max);
  return grade?.name || 'غير محدد';
}

function getGradeBadge(score: number) {
  const grade = evaluationGrades.find(g => score >= g.min && score <= g.max);
  return grade?.color || 'bg-gray-100 text-gray-800';
}