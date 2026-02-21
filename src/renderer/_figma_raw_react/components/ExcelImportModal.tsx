import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Eye,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { generateExcelTemplate, validateEmployeeData, TEMPLATE_HEADERS, SAMPLE_TEMPLATE_DATA } from './ExcelTemplate';

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (employees: any[]) => void;
}

interface ImportStep {
  id: number;
  title: string;
  description: string;
}

const IMPORT_STEPS: ImportStep[] = [
  { id: 1, title: 'رفع الملف', description: 'اختر ملف Excel أو CSV' },
  { id: 2, title: 'معاينة وربط الأعمدة', description: 'تأكد من ربط الأعمدة بالحقول' },
  { id: 3, title: 'التحقق من صحة البيانات', description: 'راجع البيانات وأصلح الأخطاء' },
  { id: 4, title: 'الاستيراد والحفظ', description: 'حفظ البيانات في النظام' }
];

const FIELD_MAPPINGS = [
  { key: 'name', label: 'الاسم الثلاثي', required: true },
  { key: 'employeeNumber', label: 'رقم الموظف', required: true },
  { key: 'position', label: 'المنصب', required: true },
  { key: 'department', label: 'القسم', required: true },
  { key: 'hireDate', label: 'تاريخ التعيين', required: true },
  { key: 'phone', label: 'رقم الهاتف', required: false },
  { key: 'email', label: 'البريد الإلكتروني', required: false },
  { key: 'salary', label: 'الراتب الأساسي', required: false },
  { key: 'nationalId', label: 'رقم الهوية', required: false },
  { key: 'address', label: 'العنوان', required: false },
  { key: 'grade', label: 'الدرجة الوظيفية', required: false }
];



export function ExcelImportModal({ open, onOpenChange, onImportComplete }: ExcelImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [columnMappings, setColumnMappings] = useState<{[key: string]: string}>({});
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setExcelData([]);
    setColumnMappings({});
    setValidationErrors([]);
    setImportProgress(0);
    setIsImporting(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Simulate file reading - In real implementation, use a library like xlsx
    setExcelData([
      TEMPLATE_HEADERS,
      ...SAMPLE_TEMPLATE_DATA
    ]);
    
    // Auto-detect mappings
    const headers = ['الاسم الثلاثي', 'رقم الموظف', 'المنصب', 'القسم', 'تاريخ التعيين', 'الهاتف', 'البريد الإلكتروني', 'الراتب', 'رقم الهوية', 'العنوان', 'الدرجة'];
    const autoMappings: {[key: string]: string} = {};
    
    FIELD_MAPPINGS.forEach((field, index) => {
      if (headers[index]) {
        autoMappings[field.key] = `column_${index}`;
      }
    });
    
    setColumnMappings(autoMappings);
    setCurrentStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (excelFile) {
      handleFileSelect(excelFile);
    } else {
      toast.error('يرجى اختيار ملف Excel أو CSV صالح');
    }
  };

  const validateData = () => {
    const errors: any[] = [];
    const dataRows = excelData.slice(1); // Skip header row
    
    dataRows.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Check required fields
      FIELD_MAPPINGS.filter(field => field.required).forEach(field => {
        const columnIndex = parseInt(columnMappings[field.key]?.replace('column_', '') || '-1');
        if (columnIndex === -1 || !row[columnIndex] || row[columnIndex].toString().trim() === '') {
          rowErrors.push(`${field.label} مطلوب`);
        }
      });
      
      // Validate email format
      const emailColumnIndex = parseInt(columnMappings['email']?.replace('column_', '') || '-1');
      if (emailColumnIndex !== -1 && row[emailColumnIndex] && 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[emailColumnIndex].toString())) {
        rowErrors.push('تنسيق البريد الإلكتروني غير صحيح');
      }
      
      // Validate phone format
      const phoneColumnIndex = parseInt(columnMappings['phone']?.replace('column_', '') || '-1');
      if (phoneColumnIndex !== -1 && row[phoneColumnIndex] && 
          !/^05\d{8}$/.test(row[phoneColumnIndex].toString().replace(/\s/g, ''))) {
        rowErrors.push('تنسيق رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05)');
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          rowIndex: index + 2, // +2 because Excel starts from 1 and we skip header
          errors: rowErrors,
          data: row
        });
      }
    });
    
    setValidationErrors(errors);
    setCurrentStep(3);
  };

  const performImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    const dataRows = excelData.slice(1);
    const validRows = dataRows.filter((_, index) => 
      !validationErrors.some(error => error.rowIndex === index + 2)
    );
    
    const employees = validRows.map((row, index) => {
      const employee: any = {
        id: Date.now() + index,
        status: 'نشط',
        courses: [],
        evaluations: [],
        promotions: [],
        leaves: [],
        absences: [],
        salaryDetails: {
          basicSalary: 0,
          allowances: 0,
          housing: 0,
          transport: 0,
          experience: 0,
          overtime: 0,
          deductions: {
            insurance: 0,
            loans: 0,
            advances: 0
          }
        }
      };
      
      // Map data based on column mappings
      Object.entries(columnMappings).forEach(([fieldKey, columnKey]) => {
        const columnIndex = parseInt(columnKey.replace('column_', ''));
        if (columnIndex !== -1 && row[columnIndex] !== undefined) {
          let value = row[columnIndex];
          
          // Special handling for salary
          if (fieldKey === 'salary') {
            const numValue = parseFloat(value.toString().replace(/,/g, ''));
            employee[fieldKey] = isNaN(numValue) ? 0 : numValue;
            employee.salaryDetails.basicSalary = isNaN(numValue) ? 0 : numValue;
          } else {
            employee[fieldKey] = value.toString();
          }
        }
      });
      
      return employee;
    });
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsImporting(false);
    setCurrentStep(4);
    
    setTimeout(() => {
      onImportComplete(employees);
      toast.success(`تم استيراد ${employees.length} موظف بنجاح`);
      onOpenChange(false);
      resetModal();
    }, 2000);
  };

  const downloadTemplate = () => {
    // In real implementation, generate and download Excel template
    toast.success('سيتم تنزيل النموذج قريباً');
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">اسحب وأفلت ملف Excel هنا</h3>
                <p className="text-gray-500 mb-4">أو انقر لاختيار ملف من جهازك</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400">الصيغ المدعومة: .xlsx, .xls, .csv</p>
                  <p className="text-sm text-gray-400">الحد الأقصى: 1000 موظف</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  اختيار ملف
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>
              
              {selectedFile && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div className="text-right">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="border-t pt-6">
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 ml-2" />
                تنزيل النموذج الفارغ
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                قم بتنزيل النموذج لضمان التنسيق الصحيح للبيانات
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <Eye className="w-4 h-4" />
              <AlertDescription>
                تأكد من ربط أعمدة الملف بالحقول الصحيحة. الحقول المطلوبة مميزة بعلامة *
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">ربط الأعمدة</h4>
                <div className="space-y-3">
                  {FIELD_MAPPINGS.map(field => (
                    <div key={field.key} className="flex items-center justify-between">
                      <Label className="text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </Label>
                      <Select
                        value={columnMappings[field.key] || ''}
                        onValueChange={(value) => 
                          setColumnMappings(prev => ({ ...prev, [field.key]: value }))
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="اختر عمود" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">لا شيء</SelectItem>
                          {excelData[0]?.map((header, index) => (
                            <SelectItem key={index} value={`column_${index}`}>
                              {header || `عمود ${index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">معاينة البيانات (أول 5 صفوف)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {excelData[0]?.map((header, index) => (
                          <TableHead key={index} className="text-xs">
                            {header || `عمود ${index + 1}`}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {excelData.slice(1, 6).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="text-xs">
                              {cell?.toString() || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">نتائج التحقق من صحة البيانات</h4>
              <Badge variant={validationErrors.length > 0 ? "destructive" : "default"}>
                {validationErrors.length === 0 ? 'جميع البيانات صحيحة' : `${validationErrors.length} خطأ`}
              </Badge>
            </div>

            {validationErrors.length > 0 ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    تم العثور على أخطاء في البيانات. يرجى مراجعة الأخطاء أدناه وإصلاحها قبل المتابعة.
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الصف</TableHead>
                        <TableHead>الأخطاء</TableHead>
                        <TableHead>البيانات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationErrors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {error.rowIndex}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {error.errors.map((err: string, i: number) => (
                                <Badge key={i} variant="destructive" className="text-xs">
                                  {err}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {error.data.slice(0, 3).join(' | ')}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex space-x-reverse space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <RefreshCw className="w-4 h-4 ml-2" />
                    رفع ملف جديد
                  </Button>
                  <Button onClick={performImport}>
                    تجاهل الأخطاء والمتابعة
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">جميع البيانات صحيحة!</h3>
                <p className="text-green-600 mb-6">
                  جاهز لاستيراد {excelData.length - 1} موظف
                </p>
                <Button onClick={performImport} className="bg-green-600 hover:bg-green-700">
                  بدء الاستيراد
                </Button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            {isImporting ? (
              <div className="space-y-6">
                <RefreshCw className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-medium mb-2">جاري الاستيراد...</h3>
                  <p className="text-gray-600 mb-4">يرجى الانتظار أثناء حفظ البيانات</p>
                  <Progress value={importProgress} className="w-64 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">{importProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">تم الاستيراد بنجاح!</h3>
                  <p className="text-green-600 mb-6">
                    تم استيراد الموظفين وحفظهم في النظام
                  </p>
                  <Button 
                    onClick={() => {
                      onOpenChange(false);
                      resetModal();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    عرض الموظفين المستوردين
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-reverse space-x-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>استيراد الموظفين من Excel</span>
          </DialogTitle>
          <DialogDescription>
            استيراد بيانات الموظفين من ملف Excel أو CSV بسهولة وأمان مع التحقق من صحة البيانات
          </DialogDescription>
        </DialogHeader>

        {/* Steps Progress */}
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center justify-between">
            {IMPORT_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step.id}
                </div>
                <div className="mr-3 text-right">
                  <p className={`font-medium text-sm ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < IMPORT_STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {getStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isImporting}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            السابق
          </Button>
          
          <div className="space-x-reverse space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetModal();
              }}
              disabled={isImporting}
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            
            {currentStep === 2 && (
              <Button onClick={validateData}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                التالي: التحقق من البيانات
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}