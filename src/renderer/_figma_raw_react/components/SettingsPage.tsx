import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { Database, Activity, Save, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('connection');

  return (
    <div className="p-8 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">إعدادات النظام</h1>
      
      <Tabs defaultValue="connection" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="connection">
            <Database className="w-4 h-4 ml-2" />
            إعدادات الاتصال
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="w-4 h-4 ml-2" />
            تشخيص النظام
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="mt-6">
          <ConnectionSettings />
        </TabsContent>
        
        <TabsContent value="health" className="mt-6">
          <HealthCheck />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectionSettings() {
  const [config, setConfig] = useState({
    server: '',
    database: '',
    authMode: 'windows',
    user: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // @ts-ignore
      const savedConfig = await window.electron.invoke('connection:get-config');
      setConfig(savedConfig);
    } catch (err) {
      toast.error('فشل تحميل الإعدادات');
    }
  };

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getFriendlyErrorMessage = (error: string) => {
    if (error.includes('ELOGIN') || error.includes('Login failed')) {
      return 'بيانات تسجيل الدخول غير صحيحة أو وضع المصادقة غير صحيح';
    }
    if (error.includes('ETIMEOUT') || error.includes('timeout') || error.includes('network-related') || error.includes('provider: Named Pipes Provider, error: 40')) {
      return 'تعذر الوصول إلى SQL Server (تحقق من TCP/IP والخدمة)';
    }
    if (error.includes('does not exist') || error.includes('open database')) {
      return 'قاعدة البيانات غير موجودة، يرجى الاستعادة أو الإنشاء';
    }
    return `فشل الاتصال: ${error}`;
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // @ts-ignore
      const result = await window.electron.invoke('connection:test', config);
      if (result.success) {
        toast.success('تم الاتصال بنجاح');
      } else {
        toast.error(getFriendlyErrorMessage(result.error));
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err.message || 'حدث خطأ غير متوقع'));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.electron.invoke('connection:save-config', config);
      if (result.success) {
        toast.success('تم حفظ الإعدادات وإعادة الاتصال');
      } else {
        toast.error(getFriendlyErrorMessage(result.error));
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err.message || 'حدث خطأ أثناء الحفظ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات قاعدة البيانات</CardTitle>
        <CardDescription>تكوين الاتصال بـ SQL Server</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>خادم قاعدة البيانات (Server)</Label>
          <Input 
            value={config.server} 
            onChange={e => handleChange('server', e.target.value)} 
            placeholder="localhost\SQLEXPRESS" 
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label>اسم قاعدة البيانات (Database)</Label>
          <Input 
            value={config.database} 
            onChange={e => handleChange('database', e.target.value)} 
            placeholder="EmployeeManagement" 
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label>نوع المصادقة (Authentication)</Label>
          <RadioGroup 
            value={config.authMode} 
            onValueChange={val => handleChange('authMode', val)}
            className="flex flex-row space-x-reverse space-x-4"
          >
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="windows" id="auth-windows" />
              <Label htmlFor="auth-windows">Windows Authentication</Label>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="sql" id="auth-sql" />
              <Label htmlFor="auth-sql">SQL Server Authentication</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              {config.authMode === 'windows' ? 'اسم مستخدم Windows (DOMAIN\\User)' : 'اسم المستخدم (User)'}
            </Label>
            <Input 
              value={config.user || ''} 
              onChange={e => handleChange('user', e.target.value)} 
              dir="ltr"
              placeholder={config.authMode === 'windows' ? 'DESKTOP-XXX\\User' : 'sa'}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {config.authMode === 'windows' ? 'كلمة مرور Windows' : 'كلمة المرور (Password)'}
            </Label>
            <Input 
              type="password" 
              value={config.password || ''} 
              onChange={e => handleChange('password', e.target.value)} 
              dir="ltr"
            />
          </div>
        </div>
        
        {config.authMode === 'windows' && (
             <div className="flex items-center p-3 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-200">
                <AlertTriangle className="w-4 h-4 ml-2 flex-shrink-0" />
                <p>
                  ملاحظة: في النسخة المحمولة (Portable)، يتطلب استخدام "Windows Authentication" إدخال اسم المستخدم وكلمة المرور الخاصة بنظام Windows (Domain\User).
                </p>
             </div>
        )}

        <div className="flex justify-end space-x-reverse space-x-4 pt-4">
            <Button variant="outline" onClick={handleTest} disabled={testing || loading}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testing ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthCheck() {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const runHealthCheck = async () => {
    setLoading(true);
    setChecks([]);
    setOverallStatus('pending');
    
    try {
      // @ts-ignore
      const result = await window.electron.invoke('diagnostics:run-all');
      if (result.success) {
         setChecks(result.checks);
         setOverallStatus(result.overall ? 'success' : 'error');
      } else {
         toast.error(result.error || 'فشل تشغيل التشخيص');
         setOverallStatus('error');
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع');
      setOverallStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Auto run on mount
  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>تشخيص النظام</CardTitle>
        <CardDescription>فحص حالة النظام والاتصال بقاعدة البيانات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="text-lg font-medium">حالة النظام: 
                <span className={overallStatus === 'success' ? 'text-green-600 mr-2' : overallStatus === 'error' ? 'text-red-600 mr-2' : 'text-gray-600 mr-2'}>
                    {overallStatus === 'success' ? 'يعمل بشكل جيد' : overallStatus === 'error' ? 'توجد مشاكل' : 'جاري الفحص...'}
                </span>
            </div>
            <Button onClick={runHealthCheck} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                إعادة الفحص
            </Button>
        </div>

        <div className="space-y-4">
            {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-3">
                        {check.status === 'success' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : check.status === 'error' ? (
                            <XCircle className="w-6 h-6 text-red-500" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        )}
                        <div>
                            <h3 className="font-medium">{check.name}</h3>
                            <p className="text-sm text-gray-500">{check.message}</p>
                        </div>
                    </div>
                    {check.details && (
                        <div className="text-sm text-gray-400 font-mono">
                            {check.details}
                        </div>
                    )}
                </div>
            ))}
            
            {loading && checks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    جاري الفحص...
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
