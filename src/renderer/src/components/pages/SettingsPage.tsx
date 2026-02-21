import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Save, Building, User, Upload, Image as ImageIcon, Database, Activity, Loader2, CheckCircle2, XCircle, AlertTriangle, DollarSign, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab')!)
    }
  }, [searchParams])

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-8" dir="rtl">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">تخصيص هوية المؤسسة والاتصال بقاعدة البيانات</p>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="general">
            <Building className="w-4 h-4 ml-2" />
            إعدادات عامة
          </TabsTrigger>
          <TabsTrigger value="connection">
            <Database className="w-4 h-4 ml-2" />
            إعدادات الاتصال
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="w-4 h-4 ml-2" />
            تشخيص النظام
          </TabsTrigger>
          <TabsTrigger value="exchange-rates">
            <DollarSign className="w-4 h-4 ml-2" />
            أسعار الصرف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="connection" className="mt-6">
          <ConnectionSettings />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <HealthCheck />
        </TabsContent>

        <TabsContent value="exchange-rates" className="mt-6">
          <ExchangeRatesTab />
        </TabsContent>
      </Tabs>

    </div>
  )
}

function GeneralSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    orgName: '',
    preparedBy: '',
    orgLogo: '' // Base64 string
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const saved = await window.api.invoke('settings:get')
      if (saved) {
        setSettings(prev => ({ ...prev, ...saved }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, orgLogo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await window.api.invoke('settings:save', settings)
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>بيانات المؤسسة</CardTitle>
        <CardDescription>تخصيص اسم وشعار المؤسسة للتقارير</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>اسم المؤسسة</Label>
          <Input
            type="text"
            value={settings.orgName}
            onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
            placeholder="أدخل اسم المؤسسة"
          />
        </div>

        <div className="space-y-2">
          <Label>شعار المؤسسة</Label>
          <div className="flex items-start gap-4">
            <div className="relative group cursor-pointer border-2 border-dashed border-border rounded-xl p-1 w-32 h-32 flex items-center justify-center hover:bg-muted/50 transition-colors overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {settings.orgLogo ? (
                <img
                  src={settings.orgLogo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">رفع شعار</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground py-2">
              <p>صيغ مدعومة: PNG, JPG</p>
              <p>الحجم الموصى به: 200x200 بكسل</p>
              {settings.orgLogo && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={() => setSettings(prev => ({ ...prev, orgLogo: '' }))}
                >
                  حذف الشعار
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
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
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // @ts-ignore
      const savedConfig = await window.api.invoke('connection:get-config');
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
      const result = await window.api.invoke('connection:test', config);
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
      const result = await window.api.invoke('connection:save-config', config);
      if (result.success) {
        toast.success('تم حفظ الإعدادات وإعادة الاتصال');
        // Reload page after delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(getFriendlyErrorMessage(result.error));
      }
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err.message || 'حدث خطأ أثناء الحفظ'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    try {
      const result = await window.api.backup.createManual();
      if (result.success) {
        toast.success(`تم إنشاء النسخة الاحتياطية بنجاح في: ${result.path}`);
      } else {
        toast.error(result.error || 'فشل إنشاء النسخة الاحتياطية');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setBackingUp(false);
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

        {/* Manual Backup Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium mb-2">النسخ الاحتياطي</h3>
          <p className="text-sm text-muted-foreground mb-4">
            إنشاء نسخة احتياطية يدوية من قاعدة البيانات في الموقع الذي تختاره
          </p>
          <Button
            variant="outline"
            onClick={handleManualBackup}
            disabled={backingUp}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 ml-2" />
            {backingUp ? 'جاري إنشاء النسخة الاحتياطية...' : 'نسخ احتياطي يدوي'}
          </Button>
        </div>

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
      const result = await window.api.invoke('diagnostics:run-all');
      if (result && result.checks) {
        setChecks(result.checks);
        const allSuccess = result.checks.every((c: any) => c.status === 'success');
        setOverallStatus(allSuccess ? 'success' : 'error');
      } else {
        toast.error(result?.error || 'فشل تشغيل التشخيص');
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
        <CardDescription>
          فحص حالة النظام والاتصال بقاعدة البيانات. يتم التحقق من جميع المكونات الأساسية للتأكد من عملها بشكل صحيح.
          <br />
          <span className="text-blue-600 font-medium mt-2 block">
            💡 تلميح: يتم تشغيل هذه الفحوصات تلقائياً عند فتح لوحة التحكم. الفحوصات الخضراء تعني أن كل شيء يعمل بشكل صحيح.
          </span>
        </CardDescription>
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

function ExchangeRatesTab() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({
    from_currency: 'USD',
    to_currency: 'TRY',
    rate: '',
    effective_from: new Date().toISOString().split('T')[0],
    is_active: false,
    note: ''
  });
  const [previewAmount, setPreviewAmount] = useState('100');
  const [conversionResult, setConversionResult] = useState<any>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const result = await window.api.invoke('exchange-rates:history');
      setRates(result || []);
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      toast.error('فشل تحميل أسعار الصرف');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async () => {
    if (!newRate.rate || parseFloat(newRate.rate) <= 0) {
      toast.error('يرجى إدخال سعر صرف صحيح');
      return;
    }

    try {
      // @ts-ignore
      await window.api.invoke('exchange-rates:create', {
        ...newRate,
        rate: parseFloat(newRate.rate)
      });
      toast.success('تم إضافة سعر الصرف بنجاح');
      setShowAddForm(false);
      setNewRate({
        from_currency: 'USD',
        to_currency: 'TRY',
        rate: '',
        effective_from: new Date().toISOString().split('T')[0],
        is_active: false,
        note: ''
      });
      await loadRates();
    } catch (error) {
      console.error('Failed to add exchange rate:', error);
      toast.error('فشل إضافة سعر الصرف');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      // @ts-ignore
      await window.api.invoke('exchange-rates:activate', id);
      toast.success('تم تفعيل سعر الصرف');
      await loadRates();
    } catch (error) {
      console.error('Failed to activate rate:', error);
      toast.error('فشل تفعيل سعر الصرف');
    }
  };

  const handlePreviewConversion = async () => {
    const amount = parseFloat(previewAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      // @ts-ignore
      const result = await window.api.invoke('exchange-rates:conversion-preview', amount);
      setConversionResult(result);
      if (!result.success) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Failed to preview conversion:', error);
      toast.error('فشل حساب التحويل');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>أسعار الصرف</CardTitle>
              <CardDescription>إدارة أسعار صرف العملات</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'إلغاء' : 'إضافة سعر جديد'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAddForm && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <h3 className="font-medium">إضافة سعر صرف جديد</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>من عملة</Label>
                  <Input
                    value={newRate.from_currency}
                    onChange={(e) => setNewRate({ ...newRate, from_currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>إلى عملة</Label>
                  <Input
                    value={newRate.to_currency}
                    onChange={(e) => setNewRate({ ...newRate, to_currency: e.target.value })}
                    placeholder="TRY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سعر الصرف</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newRate.rate}
                    onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                    placeholder="33.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ السريان</Label>
                  <Input
                    type="date"
                    value={newRate.effective_from}
                    onChange={(e) => setNewRate({ ...newRate, effective_from: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>ملاحظات</Label>
                  <Input
                    value={newRate.note}
                    onChange={(e) => setNewRate({ ...newRate, note: e.target.value })}
                    placeholder="ملاحظات اختيارية"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-reverse space-x-2">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={newRate.is_active}
                    onChange={(e) => setNewRate({ ...newRate, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is-active">تفعيل هذا السعر فوراً</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddRate}>حفظ السعر</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أسعار صرف مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-right">من</th>
                    <th className="p-3 text-right">إلى</th>
                    <th className="p-3 text-right">السعر</th>
                    <th className="p-3 text-right">تاريخ السريان</th>
                    <th className="p-3 text-right">الحالة</th>
                    <th className="p-3 text-right">ملاحظات</th>
                    <th className="p-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{rate.from_currency}</td>
                      <td className="p-3">{rate.to_currency}</td>
                      <td className="p-3 font-mono">{parseFloat(rate.rate).toFixed(4)}</td>
                      <td className="p-3">{new Date(rate.effective_from).toLocaleDateString('ar-SA')}</td>
                      <td className="p-3">
                        {rate.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">نشط</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">غير نشط</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{rate.note || '-'}</td>
                      <td className="p-3">
                        {!rate.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivate(rate.id)}
                          >
                            تفعيل
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Preview */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة التحويل</CardTitle>
          <CardDescription>احسب تحويل العملة باستخدام السعر النشط</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>المبلغ (USD)</Label>
              <Input
                type="number"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            <Button onClick={handlePreviewConversion}>احسب</Button>
          </div>

          {conversionResult && conversionResult.success && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">المبلغ الأصلي</p>
                  <p className="text-lg font-bold">{conversionResult.amount} {conversionResult.fromCurrency}</p>
                </div>
                <div>
                  <p className="text-gray-600">المبلغ المحول</p>
                  <p className="text-lg font-bold text-blue-600">
                    {conversionResult.convertedAmount.toFixed(2)} {conversionResult.toCurrency}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">سعر الصرف: {conversionResult.rate.toFixed(4)}</p>
                  <p className="text-gray-600 text-xs">ساري من: {new Date(conversionResult.effectiveFrom).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
