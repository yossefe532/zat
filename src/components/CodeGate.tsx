'use client';

import { useState } from 'react';
import { ArrowRight, Check, Lock, Mail, Phone, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildWhatsappLink } from '@/lib/utils';

interface CodeGateProps {
  lang: 'ar' | 'en';
  onVerify: (code: string) => Promise<{
    success: boolean;
    error?: string;
    notificationUrl?: string;
  }>;
  onBack: () => void;
  onSkip: () => void;
  onCodeRequestCreated: (whatsappUrl: string) => void;
  codeRequestWhatsappUrl: string | null;
}

export function CodeGate({
  lang,
  onVerify,
  onBack,
  onSkip,
  onCodeRequestCreated,
  codeRequestWhatsappUrl,
}: CodeGateProps) {
  const isAr = lang === 'ar';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(isAr ? 'الرجاء إدخال كود المنحة' : 'Please enter grant code');
      return;
    }
    
    setLoading(true);
    setError('');

    const result = await onVerify(code);

    if (result.success) {
      if (result.notificationUrl) {
        window.open(result.notificationUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      setError(result.error || (isAr ? 'الكود غير صحيح أو غير مفعل' : 'Invalid or inactive code'));
    }
    
    setLoading(false);
  };

  const handleCodeRequest = () => {
    const newErrors: Record<string, string> = {};

    if (!requestData.fullName.trim()) {
      newErrors.fullName = isAr ? 'أدخل الاسم الكامل' : 'Enter full name';
    }

    if (!/^01[0-9]{9}$/.test(requestData.phone.replace(/\s/g, ''))) {
      newErrors.phone = isAr ? 'أدخل رقم هاتف صحيح' : 'Enter a valid phone number';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email.trim())) {
      newErrors.email = isAr ? 'أدخل بريدًا إلكترونيًا صحيحًا' : 'Enter a valid email address';
    }

    setRequestErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const message = isAr
      ? `مرحباً، أريد التقديم على طلب كود لمبادرة ذات.\n\nالاسم: ${requestData.fullName}\nرقم الهاتف: ${requestData.phone}\nالبريد الإلكتروني: ${requestData.email}\n\nيرجى التواصل معي لإتمام الانضمام للمبادرة.`
      : `Hello, I would like to apply for a ZAT grant code.\n\nName: ${requestData.fullName}\nPhone: ${requestData.phone}\nEmail: ${requestData.email}\n\nPlease contact me to complete the initiative application.`;

    const whatsappUrl = buildWhatsappLink('201029398592', message);
    onCodeRequestCreated(whatsappUrl);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      {/* Legacy background effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90')] bg-cover bg-center" />

      <div className="w-full max-w-xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary font-black hover:scale-105 transition-transform mb-12"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[2.5rem] border-2 border-border shadow-2xl p-8 md:p-12 space-y-10"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 border-4 border-primary/10">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-black title-font text-primary">
              {isAr ? 'أدخل كود المنحة الخاص بك' : 'Enter Your Grant Code'}
            </h2>
            <p className="text-lg text-muted-foreground font-bold">
              {isAr 
                ? '🔒 كود ZAT السري - أدخله هنا لتفعيل خصم المنحة فوراً'
                : '🔒 ZAT Secret Code - Enter it here to activate your discount'}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-base font-black text-foreground px-2">
                {isAr ? 'كود المنحة' : 'Grant Code'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder={isAr ? 'أدخل الكود الخاص بك فقط' : 'Enter your private code only'}
                  className="w-full px-8 py-6 text-center text-3xl font-black uppercase rounded-2xl border-4 border-border bg-background focus:border-primary focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all tracking-widest"
                  dir="ltr"
                />
                {code && (
                  <button
                    onClick={() => setCode('')}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-base font-black text-center bg-destructive/10 py-3 rounded-xl border border-destructive/20"
              >
                {error}
              </motion.p>
            )}
            
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-black text-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              {loading ? (
                <span className="animate-pulse">{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
              ) : (
                <>
                  {isAr ? 'تفعيل المنحة الآن' : 'Activate Grant Now'}
                  <Check className="w-8 h-8" />
                </>
              )}
            </button>
          </div>
          
          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border border-dashed" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-card text-muted-foreground font-black text-lg">
                {isAr ? 'أو' : 'Or'}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={() => setShowRequestForm((prev) => !prev)}
              className="w-full py-5 rounded-2xl border-2 border-border bg-background text-foreground font-black text-xl hover:bg-muted/50 transition-all hover:border-primary/50"
            >
              {isAr ? 'التقديم على طلب كود' : 'Apply for a Code'}
            </button>

            {showRequestForm && (
              <div className="rounded-3xl border-2 border-border bg-background p-6 text-right space-y-4">
                <h3 className="text-xl font-black text-primary title-font text-center">
                  {isAr ? 'طلب كود جديد' : 'Request a New Code'}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black">
                    <User className="w-4 h-4 text-primary" />
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={requestData.fullName}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder={isAr ? 'اكتب اسمك الكامل' : 'Enter your full name'}
                  />
                  {requestErrors.fullName && <p className="text-sm text-destructive font-bold">{requestErrors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black">
                    <Phone className="w-4 h-4 text-primary" />
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={requestData.phone}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                  {requestErrors.phone && <p className="text-sm text-destructive font-bold">{requestErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-black">
                    <Mail className="w-4 h-4 text-primary" />
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={requestData.email}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder={isAr ? 'name@example.com' : 'name@example.com'}
                    dir="ltr"
                  />
                  {requestErrors.email && <p className="text-sm text-destructive font-bold">{requestErrors.email}</p>}
                </div>
                <button
                  onClick={handleCodeRequest}
                  className="w-full rounded-2xl bg-primary py-4 text-lg font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                  {isAr ? 'إرسال طلب الانضمام' : 'Send Application Request'}
                </button>
                {codeRequestWhatsappUrl && (
                  <a
                    href={codeRequestWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm font-black text-primary underline"
                  >
                    {isAr ? 'فتح رسالة الطلب مرة أخرى' : 'Open the request message again'}
                  </a>
                )}
              </div>
            )}
            
            <p className="text-center text-base text-muted-foreground font-bold">
              {isAr 
                ? 'يمكنك أيضًا متابعة التسجيل بدون كود إذا لم تكن لديك منحة حالية.'
                : 'You can also continue without a code if you do not have an active grant.'}
            </p>

            <button
              onClick={onSkip}
              className="w-full py-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary font-black text-lg hover:bg-primary/10 transition-all"
            >
              {isAr ? 'متابعة بدون كود' : 'Continue Without a Code'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
