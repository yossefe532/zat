'use client';

import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Gift, BarChart3, 
  Search, Download, Plus, Trash2, Edit2, X, Check,
  LogOut, Moon, Sun, Clock, Send
} from 'lucide-react';
import { COURSES, DEFAULT_GRANT_CODES } from '@/lib/data';
import { formatPrice } from '@/lib/utils';

type Tab = 'dashboard' | 'registrations' | 'courses' | 'codes';

interface Registration {
  id: string;
  full_name: string;
  phone: string;
  age: number;
  courses: number[];
  total_price: number;
  first_installment: number;
  second_installment: number;
  registration_code: string;
  grant_code_used: string;
  created_at: string;
}

interface GrantCode {
  code: string;
  nameAr: string;
  nameEn: string;
  whatsappNumber: string;
  isActive: boolean;
}

interface CourseStat {
  id: number;
  icon: string;
  nameAr: string;
  nameEn: string;
  level: string;
  count: number;
}

interface DashboardStats {
  totalRegistrations: number;
  totalRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
  courseStats: CourseStat[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('zat_theme') as 'light' | 'dark' | null) || 'light';
  });
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  
  // Data states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [grantCodes, setGrantCodes] = useState<GrantCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState<GrantCode | null>(null);
  const [sendPhone, setSendPhone] = useState('');
  const [sendMode, setSendMode] = useState<'template' | 'text'>('template');
  const [sendMessage, setSendMessage] = useState('');
  const [templateName, setTemplateName] = useState('first_contact');
  const [templateLang, setTemplateLang] = useState('ar');
  const [templateParams, setTemplateParams] = useState(['', '', '']);
  const [sendStatus, setSendStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function loadData() {
    const savedRegs = localStorage.getItem('zat_registrations');
    const savedCodes = localStorage.getItem('zat_grant_codes');

    setRegistrations(savedRegs ? JSON.parse(savedRegs) : []);

    if (savedCodes) {
      setGrantCodes(JSON.parse(savedCodes));
      return;
    }

    const defaultCodes: GrantCode[] = Object.entries(DEFAULT_GRANT_CODES).map(([code, data]) => ({
      code,
      ...data
    }));
    setGrantCodes(defaultCodes);
    localStorage.setItem('zat_grant_codes', JSON.stringify(defaultCodes));
  }

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('zat_theme', theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/me', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json().catch(() => ({}))) as { authenticated?: boolean };
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadData();
      }
    })();
  }, []);

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError(lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
      return;
    }

    setIsAuthenticated(true);
    loadData();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const handleSendWhatsapp = async () => {
    setSendStatus(null);
    const body =
      sendMode === 'template'
        ? {
            to: sendPhone,
            template: {
              name: templateName,
              language: templateLang,
              bodyParams: templateParams.filter(Boolean),
            },
          }
        : {
            to: sendPhone,
            message: sendMessage,
          };

    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setSendStatus({
        ok: false,
        text: lang === 'ar'
          ? 'فشل إرسال الرسالة. تأكد من اسم القالب، لغة القالب، واعتماد القالب داخل Meta.'
          : 'Failed to send. Please check the template name, language, and approval status in Meta.',
      });
      return;
    }

    setSendStatus({
      ok: true,
      text: sendMode === 'template'
        ? (lang === 'ar' ? 'تم إرسال القالب بنجاح من الرقم الموحد.' : 'Template sent successfully from the unified number.')
        : (lang === 'ar' ? 'تم إرسال الرسالة بنجاح.' : 'Message sent successfully.'),
    });
    setSendPhone('');
    setSendMessage('');
    setTemplateParams(['', '', '']);
  };

  const saveGrantCodes = (data: GrantCode[]) => {
    setGrantCodes(data);
    localStorage.setItem('zat_grant_codes', JSON.stringify(data));
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Name', 'Phone', 'Age', 'Courses', 'Total', 'Grant Code', 'Date'];
    const rows = registrations.map(reg => [
      reg.registration_code,
      reg.full_name,
      reg.phone,
      reg.age,
      reg.courses.map(id => COURSES.find(c => c.id === id)?.nameAr || id).join(', '),
      reg.total_price,
      reg.grant_code_used,
      new Date(reg.created_at).toLocaleDateString('ar-EG')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredRegistrations = registrations.filter(reg => {
    const query = searchQuery.toLowerCase();
    return (
      reg.full_name.toLowerCase().includes(query) ||
      reg.phone.includes(query) ||
      reg.registration_code.toLowerCase().includes(query)
    );
  });

  const stats = {
    totalRegistrations: registrations.length,
    totalRevenue: registrations.reduce((sum, r) => sum + r.total_price, 0),
    collectedAmount: registrations.reduce((sum, r) => sum + r.first_installment, 0),
    pendingAmount: registrations.reduce((sum, r) => sum + r.second_installment, 0),
    courseStats: COURSES.map(course => ({
      ...course,
      count: registrations.filter(r => r.courses.includes(course.id)).length
    })).sort((a, b) => b.count - a.count)
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {lang === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {lang === 'ar' ? 'أدخل كلمة المرور للمتابعة' : 'Enter password to continue'}
            </p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              {lang === 'ar' ? 'دخول' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl">
              <span className="text-primary">ZAT</span>
              <span className="text-muted-foreground">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-3.5rem)] border-r bg-card p-4 hidden md:block">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: lang === 'ar' ? 'الإحصائيات' : 'Dashboard' },
              { id: 'registrations', icon: Users, label: lang === 'ar' ? 'التسجيلات' : 'Registrations' },
              { id: 'courses', icon: GraduationCap, label: lang === 'ar' ? 'الكورسات' : 'Courses' },
              { id: 'codes', icon: Gift, label: lang === 'ar' ? 'الأكواد' : 'Grant Codes' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex">
          {[
            { id: 'dashboard', icon: BarChart3, label: lang === 'ar' ? 'الإحصائيات' : 'Dashboard' },
            { id: 'registrations', icon: Users, label: lang === 'ar' ? 'التسجيلات' : 'Registrations' },
            { id: 'codes', icon: Gift, label: lang === 'ar' ? 'الأكواد' : 'Grant Codes' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <>
              <DashboardTab stats={stats} lang={lang} />
              <AdminWhatsappSender
                lang={lang}
                phone={sendPhone}
                mode={sendMode}
                message={sendMessage}
                templateName={templateName}
                templateLang={templateLang}
                templateParams={templateParams}
                status={sendStatus}
                onPhoneChange={setSendPhone}
                onModeChange={setSendMode}
                onMessageChange={setSendMessage}
                onTemplateNameChange={setTemplateName}
                onTemplateLangChange={setTemplateLang}
                onTemplateParamChange={(index, value) => {
                  setTemplateParams((prev) => prev.map((item, i) => (i === index ? value : item)));
                }}
                onSend={handleSendWhatsapp}
              />
            </>
          )}
          
          {activeTab === 'registrations' && (
            <RegistrationsTab
              registrations={filteredRegistrations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onExport={exportToCSV}
              lang={lang}
            />
          )}
          
          {activeTab === 'courses' && (
            <CoursesTab stats={stats.courseStats} lang={lang} />
          )}
          
          {activeTab === 'codes' && (
            <CodesTab
              codes={grantCodes}
              onAdd={(code) => {
                saveGrantCodes([...grantCodes, code]);
                setShowAddCodeModal(false);
              }}
              onUpdate={(code) => {
                saveGrantCodes(grantCodes.map(c => c.code === code.code ? code : c));
                setEditingCode(null);
              }}
              onDelete={(code) => {
                saveGrantCodes(grantCodes.filter(c => c.code !== code));
              }}
              showAddModal={showAddCodeModal}
              setShowAddModal={setShowAddCodeModal}
              editingCode={editingCode}
              setEditingCode={setEditingCode}
              lang={lang}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardTab({ stats, lang }: { stats: DashboardStats; lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar';
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isAr ? 'الإحصائيات' : 'Dashboard'}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isAr ? 'إجمالي التسجيلات' : 'Total Registrations'}
          value={stats.totalRegistrations}
          icon={Users}
          color="primary"
        />
        <StatCard
          label={isAr ? 'إجمالي الإيراد' : 'Total Revenue'}
          value={`${formatPrice(stats.totalRevenue)} ${isAr ? 'جنيه' : 'EGP'}`}
          icon={BarChart3}
          color="success"
        />
        <StatCard
          label={isAr ? 'المحصّل' : 'Collected'}
          value={`${formatPrice(stats.collectedAmount)} ${isAr ? 'جنيه' : 'EGP'}`}
          icon={Check}
          color="warning"
        />
        <StatCard
          label={isAr ? 'المتبقي' : 'Pending'}
          value={`${formatPrice(stats.pendingAmount)} ${isAr ? 'جنيه' : 'EGP'}`}
          icon={Clock}
          color="destructive"
        />
      </div>
      
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isAr ? 'الكورسات الأكثر طلباً' : 'Most Popular Courses'}
        </h2>
        <div className="space-y-4">
          {stats.courseStats.slice(0, 5).map((course: CourseStat) => (
            <div key={course.id} className="flex items-center gap-4">
              <span className="text-2xl">{course.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{isAr ? course.nameAr : course.nameEn}</p>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(course.count / stats.totalRegistrations) * 100 || 0}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-primary">{course.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminWhatsappSender({
  lang,
  phone,
  mode,
  message,
  templateName,
  templateLang,
  templateParams,
  status,
  onPhoneChange,
  onModeChange,
  onMessageChange,
  onTemplateNameChange,
  onTemplateLangChange,
  onTemplateParamChange,
  onSend,
}: {
  lang: 'ar' | 'en';
  phone: string;
  mode: 'template' | 'text';
  message: string;
  templateName: string;
  templateLang: string;
  templateParams: string[];
  status: { ok: boolean; text: string } | null;
  onPhoneChange: (value: string) => void;
  onModeChange: (value: 'template' | 'text') => void;
  onMessageChange: (value: string) => void;
  onTemplateNameChange: (value: string) => void;
  onTemplateLangChange: (value: string) => void;
  onTemplateParamChange: (index: number, value: string) => void;
  onSend: () => void;
}) {
  const isAr = lang === 'ar';

  return (
    <div className="mt-8 rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{isAr ? 'إرسال واتساب من الرقم الموحد' : 'Send WhatsApp from unified number'}</h2>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'هذه الرسالة تُرسل عبر WhatsApp Cloud API من رقم واحد لكل الموظفين.'
              : 'This message is sent via WhatsApp Cloud API from a single unified number.'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary font-bold">
          <Send className="w-4 h-4" />
          {isAr ? 'Cloud API' : 'Cloud API'}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onModeChange('template')}
          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
            mode === 'template' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'
          }`}
        >
          {isAr ? 'قالب أول رسالة' : 'First-contact template'}
        </button>
        <button
          onClick={() => onModeChange('text')}
          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
            mode === 'text' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'
          }`}
        >
          {isAr ? 'رسالة عادية' : 'Free text'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{isAr ? 'رقم الهاتف' : 'Phone number'}</label>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="01xxxxxxxxx"
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {mode === 'template' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">{isAr ? 'اسم القالب' : 'Template name'}</label>
            <input
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              placeholder={isAr ? 'مثال: first_contact' : 'Example: first_contact'}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">{isAr ? 'نص الرسالة' : 'Message'}</label>
            <input
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={isAr ? 'اكتب الرسالة التي تريد إرسالها' : 'Write the message you want to send'}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      {mode === 'template' && (
        <div className="rounded-2xl border border-border p-4 space-y-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isAr ? 'لغة القالب' : 'Template language'}</label>
              <input
                value={templateLang}
                onChange={(e) => onTemplateLangChange(e.target.value)}
                placeholder="ar"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="text-sm text-muted-foreground flex items-end">
              {isAr
                ? 'استخدم هنا اسم القالب المعتمد داخل Meta، وأدخل المتغيرات بنفس ترتيب القالب.'
                : 'Use the approved Meta template name and fill variables in the exact template order.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templateParams.map((param, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">
                  {isAr ? `متغير ${index + 1}` : `Param ${index + 1}`}
                </label>
                <input
                  value={param}
                  onChange={(e) => onTemplateParamChange(index, e.target.value)}
                  placeholder={isAr ? `قيمة المتغير ${index + 1}` : `Value ${index + 1}`}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {status && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            status.ok ? 'border-success/20 bg-success/10 text-success' : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        onClick={onSend}
        disabled={!phone.trim() || (mode === 'template' ? !templateName.trim() : !message.trim())}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {mode === 'template'
          ? (isAr ? 'إرسال القالب' : 'Send template')
          : (isAr ? 'إرسال الرسالة' : 'Send message')}
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };
  
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function RegistrationsTab({
  registrations,
  searchQuery,
  onSearchChange,
  onExport,
  lang
}: {
  registrations: Registration[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExport: () => void;
  lang: 'ar' | 'en';
}) {
  const isAr = lang === 'ar';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{isAr ? 'التسجيلات' : 'Registrations'}</h1>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          {isAr ? 'تصدير CSV' : 'Export CSV'}
        </button>
      </div>
      
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isAr ? 'بحث بالاسم أو الهاتف أو الكود...' : 'Search by name, phone or code...'}
          className="w-full pr-12 pl-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-right py-3 px-4">{isAr ? 'الكود' : 'Code'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'الاسم' : 'Name'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'الهاتف' : 'Phone'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'الكورسات' : 'Courses'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'الإجمالي' : 'Total'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'كود المنحة' : 'Grant'}</th>
                <th className="text-right py-3 px-4">{isAr ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isAr ? 'لا توجد تسجيلات' : 'No registrations yet'}
                  </td>
                </tr>
              ) : (
                registrations.map((reg, i) => (
                  <tr key={reg.id || i} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-primary">{reg.registration_code}</td>
                    <td className="py-3 px-4">{reg.full_name}</td>
                    <td className="py-3 px-4" dir="ltr">{reg.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {reg.courses.map(id => (
                          <span key={id} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                            {COURSES.find(c => c.id === id)?.icon}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{formatPrice(reg.total_price)}</td>
                    <td className="py-3 px-4">
                      {reg.grant_code_used ? (
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">
                          {reg.grant_code_used}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {reg.created_at ? new Date(reg.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CoursesTab({ stats, lang }: { stats: CourseStat[]; lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar';
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isAr ? 'الكورسات' : 'Courses'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(course => (
          <div key={course.id} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{course.icon}</span>
              <div>
                <h3 className="font-bold">{isAr ? course.nameAr : course.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{course.level}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-muted-foreground">{isAr ? 'عدد المسجلين' : 'Students'}</span>
              <span className="text-2xl font-bold text-primary">{course.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodesTab({
  codes,
  onAdd,
  onUpdate,
  onDelete,
  showAddModal,
  setShowAddModal,
  editingCode,
  setEditingCode,
  lang
}: {
  codes: GrantCode[];
  onAdd: (code: GrantCode) => void;
  onUpdate: (code: GrantCode) => void;
  onDelete: (code: string) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  editingCode: GrantCode | null;
  setEditingCode: (code: GrantCode | null) => void;
  lang: 'ar' | 'en';
}) {
  const isAr = lang === 'ar';
  const [formData, setFormData] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    whatsappNumber: ''
  });
  
  const handleSubmit = () => {
    if (!formData.code || !formData.nameAr) return;
    
    if (editingCode) {
      onUpdate({
        ...editingCode,
        ...formData
      });
    } else {
      onAdd({
        ...formData,
        isActive: true
      });
    }
    setFormData({ code: '', nameAr: '', nameEn: '', whatsappNumber: '' });
    setShowAddModal(false);
    setEditingCode(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{isAr ? 'أكواد المنح' : 'Grant Codes'}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة كود' : 'Add Code'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {codes.map(code => (
          <div key={code.code} className="rounded-xl border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                code.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono font-bold">{code.code}</p>
                <p className="text-sm text-muted-foreground">{code.nameAr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingCode(code)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(code.code)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Modal */}
      {(showAddModal || editingCode) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCode ? (isAr ? 'تعديل الكود' : 'Edit Code') : (isAr ? 'إضافة كود جديد' : 'Add New Code')}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCode(null);
                  setFormData({ code: '', nameAr: '', nameEn: '', whatsappNumber: '' });
                }}
                className="p-2 rounded-lg hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{isAr ? 'الكود' : 'Code'}</label>
                <input
                  type="text"
                  value={editingCode ? editingCode.code : formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CODE.EDU"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono uppercase"
                  disabled={!!editingCode}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                <input
                  type="text"
                  value={editingCode ? editingCode.nameAr : formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={isAr ? 'اسم المنحة' : 'Grant Name'}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                <input
                  type="text"
                  value={editingCode ? editingCode.nameEn : formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder={isAr ? 'Grant Name' : 'Grant Name'}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">{isAr ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
                <input
                  type="text"
                  value={editingCode ? editingCode.whatsappNumber : formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="201234567890"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  dir="ltr"
                />
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                {editingCode ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
