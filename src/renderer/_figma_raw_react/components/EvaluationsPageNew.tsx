import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Plus, Edit, Trash2, Eye, Download, Star, TrendingUp, User, Calendar, FileText, Target } from 'lucide-react';
import { ProfessionalTable, createActionButtons } from './ProfessionalTable';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules, commonRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const mockEvaluations = [
  {
    id: 1,
    employeeName: 'أحمد محمد علي',
    employeeNumber: 'EMP001',
    evaluator: 'محمد الأحمد',
    evaluatorPosition: 'مدير التقنية',
    period: '2023',
    evaluationDate: '2023-12-15',
    overallScore: 4.5,
    status: 'معتمد',
    goals: 'تحسين مهارات البرمجة وقيادة الفريق',
    achievements: 'إنجاز 3 مشاريع كبيرة بنجاح',
    improvements: 'تطوير مهارات التواصل',
    evaluatorNotes: 'موظف متميز ويستحق الترقية',
    employeeComments: 'أتطلع للمزيد من التحديات',
    criteria: [
      { name: 'جودة العمل', weight: 25, score: 4.5 },
      { name: 'الإنتاجية', weight: 20, score: 4.3 },
      { name: 'التعاون', weight: 20, score: 4.6 },
      { name: 'المبادرة', weight: 15, score: 4.4 },
      { name: 'الحضور والانضباط', weight: 20, score: 4.8 }
    ]
  },
  {
    id: 2,
    employeeName: 'فاطمة عبد الله',
    employeeNumber: 'EMP002',
    evaluator: 'أحمد الزهراني',
    evaluatorPosition: 'مدير المالية',
    period: '2023',
    evaluationDate: '2023-12-10',
    overallScore: 4.3,
    status: 'معتمد',
    goals: 'تطوير مهارات التحليل المالي',
    achievements: 'تحسين كفاءة العمليات المالية بنسبة 15%',
    improvements: 'تعلم أدوات تحليلية جديدة',
    evaluatorNotes: 'أداء ممتاز ودقة عالية في العمل',
    employeeComments: 'أسعى لتطوير مهاراتي أكثر',
    criteria: [
      { name: 'جودة العمل', weight: 30, score: 4.5 },
      { name: 'الدقة', weight: 25, score: 4.7 },
      { name: 'التعاون', weight: 20, score: 4.0 },
      { name: 'المبادرة', weight: 15, score: 4.0 },
      { name: 'الحضور والانضباط', weight: 10, score: 4.2 }
    ]
  },
  {
    id: 3,
    employeeName: 'خالد عبد الرحمن',
    employeeNumber: 'EMP003',
    evaluator: 'عبدالرحمن القحطاني',
    evaluatorPosition: 'مدير العمليات',
    period: '2023',
    evaluationDate: '2023-12-05',
    overallScore: 4.7,
    status: 'معتمد',
    goals: 'قيادة المشاريع الاستراتيجية',
    achievements: 'نجح في إدارة 5 مشاريع بميزانية 2 مليون ريال',
    improvements: 'تطوير مهارات إدارة المخاطر',
    evaluatorNotes: 'قائد متميز ويحقق نتائج استثنائية',
    employeeComments: 'أحب التحديات وأسعى للتميز',
    criteria: [
      { name: 'القيادة', weight: 30, score: 4.8 },
      { name: 'إدارة المشاريع', weight: 25, score: 4.9 },
      { name: 'التعاون', weight: 20, score: 4.5 },
      { name: 'المبادرة', weight: 15, score: 4.7 },
      { name: 'النتائج', weight: 10, score: 4.6 }
    ]
  }
];

export function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEvaluationId, setDeleteEvaluationId] = useState(null);

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.employeeName.includes(searchTerm) || 
    evaluation.employeeNumber.includes(searchTerm) ||
    evaluation.evaluator.includes(searchTerm) ||
    evaluation.period.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'مسودة': 'bg-gray-100 text-gray-800',
      'مكتمل': 'bg-blue-100 text-blue-800',
      'معتمد': 'bg-green-100 text-green-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 4.0) return 'bg-blue-100 text-blue-800';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800';
    if (score >= 3.0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const handleViewEvaluation = (evaluation: any) => {
    setSelectedEvaluation(evaluation);
    setIsViewDialogOpen(true);
  };

  const handleEditEvaluation = (evaluation: any) => {
    setSelectedEvaluation(evaluation);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEvaluation = (evaluationId: number) => {
    setDeleteEvaluationId(evaluationId);
  };

  const confirmDelete = () => {
    if (deleteEvaluationId) {
      setEvaluations(evaluations.filter(evaluation => evaluation.id !== deleteEvaluationId));
      setDeleteEvaluationId(null);
      toast.success('تم حذف التقييم بنجاح');
    }
  };

  const handleAddEvaluation = (evaluationData: any) => {
    const newEvaluation = {
      ...evaluationData,
      id: Math.max(...evaluations.map(e => e.id)) + 1
    };
    setEvaluations([...evaluations, newEvaluation]);
    setIsAddDialogOpen(false);
    toast.success('تم إضافة التقييم بنجاح');
  };

  const handleUpdateEvaluation = (evaluationData: any) => {
    setEvaluations(evaluations.map(evaluation => 
      evaluation.id === selectedEvaluation?.id ? { ...evaluationData, id: selectedEvaluation.id } : evaluation
    ));
    setIsEditDialogOpen(false);
    setSelectedEvaluation(null);
    toast.success('تم تحديث التقييم بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة تقييمات الأداء</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة تقييم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة تقييم أداء جديد</DialogTitle>
              <DialogDescription>
                إنشاء تقييم أداء شامل للموظف مع المعايير والتقديرات المطلوبة
              </DialogDescription>
            </DialogHeader>
            <EvaluationForm onSave={handleAddEvaluation} onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالموظف، المقيم، أو الفترة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة تقييمات الأداء ({filteredEvaluations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTable
            columns={[
              { 
                key: 'employeeName', 
                label: 'اسم الموظف', 
                width: '180px',
                render: (value, evaluation) => (
                  <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-sm text-gray-500">{evaluation.employeeNumber}</p>
                  </div>
                )
              },
              { 
                key: 'evaluator', 
                label: 'المقيم', 
                width: '160px',
                render: (value, evaluation) => (
                  <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-sm text-gray-500">{evaluation.evaluatorPosition}</p>
                  </div>
                )
              },
              { key: 'period', label: 'فترة التقييم', width: '100px' },
              { 
                key: 'evaluationDate', 
                label: 'تاريخ التقييم', 
                width: '120px',
                render: (value) => new Date(value).toLocaleDateString('ar-SA')
              },
              { 
                key: 'overallScore', 
                label: 'التقييم الإجمالي', 
                width: '140px', 
                align: 'center',
                render: (value) => (
                  <div className="flex items-center justify-center space-x-reverse space-x-1">
                    <Badge className={getScoreBadge(value)}>
                      {value.toFixed(1)}
                    </Badge>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              },
              { 
                key: 'status', 
                label: 'الحالة', 
                width: '100px', 
                align: 'center',
                render: (value) => (
                  <Badge className={getStatusBadge(value)}>
                    {value}
                  </Badge>
                )
              },
              { 
                key: 'actions', 
                label: 'الإجراءات', 
                width: '120px', 
                align: 'center',
                render: (_, evaluation) => {
                  const actions = [
                    {
                      icon: <Eye className="w-4 h-4" />,
                      onClick: () => handleViewEvaluation(evaluation),
                      title: 'عرض تفاصيل التقييم'
                    },
                    {
                      icon: <Edit className="w-4 h-4" />,
                      onClick: () => handleEditEvaluation(evaluation),
                      title: 'تعديل التقييم'
                    },
                    {
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => handleDeleteEvaluation(evaluation.id),
                      title: 'حذف التقييم',
                      className: 'text-red-600 hover:text-red-700'
                    }
                  ];
                  
                  return createActionButtons(actions);
                }
              }
            ]}
            data={filteredEvaluations}
          />
        </CardContent>
      </Card>

      {/* View Evaluation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل تقييم الأداء</DialogTitle>
            <DialogDescription>
              عرض تقييم الأداء الشامل مع جميع المعايير والنتائج والتعليقات
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && <EvaluationDetails evaluation={selectedEvaluation} />}
        </DialogContent>
      </Dialog>

      {/* Edit Evaluation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل تقييم الأداء</DialogTitle>
            <DialogDescription>
              تعديل بيانات تقييم الأداء والمعايير والتقديرات المحددة
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <EvaluationForm 
              initialData={selectedEvaluation}
              onSave={handleUpdateEvaluation}
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEvaluationId} onOpenChange={() => setDeleteEvaluationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteEvaluationId(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EvaluationForm({ initialData, onSave, onClose }: { initialData?: any; onSave: (data: any) => void; onClose: () => void }) {
  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'البيانات الأساسية',
      icon: <User className="w-4 h-4" />,
      fields: [
        {
          name: 'employeeName',
          label: 'اسم الموظف',
          type: 'select',
          placeholder: 'اختر الموظف',
          required: true,
          options: [
            { value: 'أحمد محمد علي - EMP001', label: 'أحمد محمد علي - EMP001' },
            { value: 'فاطمة عبد الله - EMP002', label: 'فاطمة عبد الله - EMP002' },
            { value: 'خالد عبد الرحمن - EMP003', label: 'خالد عبد الرحمن - EMP003' },
            { value: 'سارة أحمد - EMP004', label: 'سارة أحمد - EMP004' }
          ]
        },
        {
          name: 'evaluator',
          label: 'المقيم',
          type: 'text',
          placeholder: 'محمد الأحمد',
          required: true
        },
        {
          name: 'evaluatorPosition',
          label: 'منصب المقيم',
          type: 'text',
          placeholder: 'مدير التقنية'
        },
        {
          name: 'period',
          label: 'فترة التقييم',
          type: 'text',
          placeholder: '2023',
          required: true
        },
        {
          name: 'evaluationDate',
          label: 'تاريخ التقييم',
          type: 'date',
          required: true
        },
        {
          name: 'status',
          label: 'حالة التقييم',
          type: 'select',
          options: [
            { value: 'مسودة', label: 'مسودة' },
            { value: 'مكتمل', label: 'مكتمل' },
            { value: 'معتمد', label: 'معتمد' }
          ]
        }
      ]
    },
    {
      id: 'performance',
      title: 'تقييم الأداء',
      icon: <TrendingUp className="w-4 h-4" />,
      fields: [
        {
          name: 'overallScore',
          label: 'التقييم الإجمالي (من 5)',
          type: 'number',
          placeholder: '4.5',
          required: true,
          min: 1,
          max: 5,
          step: 0.1
        },
        {
          name: 'goals',
          label: 'الأهداف المحددة',
          type: 'textarea',
          placeholder: 'الأهداف التي تم تحديدها للموظف...'
        },
        {
          name: 'achievements',
          label: 'الإنجازات المحققة',
          type: 'textarea',
          placeholder: 'الإنجازات التي حققها الموظف خلال الفترة...'
        },
        {
          name: 'improvements',
          label: 'مجالات التحسين',
          type: 'textarea',
          placeholder: 'المجالات التي يمكن للموظف تحسينها...'
        }
      ]
    },
    {
      id: 'feedback',
      title: 'التغذية الراجعة',
      icon: <Target className="w-4 h-4" />,
      fields: [
        {
          name: 'evaluatorNotes',
          label: 'ملاحظات المقيم',
          type: 'textarea',
          placeholder: 'ملاحظات وتعليقات المقيم...'
        },
        {
          name: 'employeeComments',
          label: 'تعليقات الموظف',
          type: 'textarea',
          placeholder: 'تعليقات ومرئيات الموظف...'
        }
      ]
    },
    {
      id: 'attachments',
      title: 'المرفقات',
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          name: 'evaluationReport',
          label: 'تقرير التقييم',
          type: 'attachment'
        },
        {
          name: 'supportingDocuments',
          label: 'مستندات داعمة',
          type: 'attachment'
        },
        {
          name: 'goals',
          label: 'ملف الأهداف',
          type: 'attachment'
        }
      ]
    }
  ];

  const validationRules: ValidationRules = {
    employeeName: commonRules.required,
    evaluator: commonRules.required,
    period: commonRules.required,
    evaluationDate: commonRules.required,
    overallScore: { required: true, min: 1, max: 5 }
  };

  const defaultData = {
    employeeName: '',
    evaluator: '',
    evaluatorPosition: '',
    period: new Date().getFullYear().toString(),
    evaluationDate: new Date().toISOString().split('T')[0],
    overallScore: 3.0,
    status: 'مسودة',
    goals: '',
    achievements: '',
    improvements: '',
    evaluatorNotes: '',
    employeeComments: '',
    ...initialData
  };

  return (
    <UniversalForm
      title={initialData ? "تعديل تقييم الأداء" : "إضافة تقييم أداء جديد"}
      sections={sections}
      validationRules={validationRules}
      initialData={defaultData}
      onSubmit={onSave}
      onCancel={onClose}
      submitLabel={initialData ? "حفظ التغييرات" : "إضافة التقييم"}
    />
  );
}

function EvaluationDetails({ evaluation }: { evaluation: any }) {
  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 4.0) return 'bg-blue-100 text-blue-800';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800';
    if (score >= 3.0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">اسم الموظف</label>
            <p className="font-medium">{evaluation.employeeName}</p>
            <p className="text-sm text-gray-500">{evaluation.employeeNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">المقيم</label>
            <p className="font-medium">{evaluation.evaluator}</p>
            <p className="text-sm text-gray-500">{evaluation.evaluatorPosition}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">فترة التقييم</label>
            <p className="font-medium">{evaluation.period}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">تاريخ التقييم</label>
            <p className="font-medium">{new Date(evaluation.evaluationDate).toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <label className="text-sm text-gray-600">التقييم الإجمالي</label>
        <div className="flex items-center space-x-reverse space-x-3 mt-2">
          <Badge className={getScoreBadge(evaluation.overallScore)}>
            {evaluation.overallScore.toFixed(1)} / 5.0
          </Badge>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= evaluation.overallScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      {evaluation.criteria && (
        <div>
          <label className="text-sm text-gray-600 mb-3 block">تفصيل معايير التقييم</label>
          <div className="space-y-3">
            {evaluation.criteria.map((criterion: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{criterion.name}</p>
                  <p className="text-sm text-gray-500">الوزن: {criterion.weight}%</p>
                </div>
                <Badge className={getScoreBadge(criterion.score)}>
                  {criterion.score.toFixed(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Fields */}
      <div className="grid grid-cols-1 gap-6">
        {evaluation.goals && (
          <div>
            <label className="text-sm text-gray-600">الأهداف المحددة</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{evaluation.goals}</p>
          </div>
        )}
        
        {evaluation.achievements && (
          <div>
            <label className="text-sm text-gray-600">الإنجازات المحققة</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{evaluation.achievements}</p>
          </div>
        )}
        
        {evaluation.improvements && (
          <div>
            <label className="text-sm text-gray-600">مجالات التحسين</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{evaluation.improvements}</p>
          </div>
        )}
        
        {evaluation.evaluatorNotes && (
          <div>
            <label className="text-sm text-gray-600">ملاحظات المقيم</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{evaluation.evaluatorNotes}</p>
          </div>
        )}
        
        {evaluation.employeeComments && (
          <div>
            <label className="text-sm text-gray-600">تعليقات الموظف</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{evaluation.employeeComments}</p>
          </div>
        )}
      </div>
    </div>
  );
}