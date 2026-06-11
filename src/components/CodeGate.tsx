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
      setError(isAr ? 'الرجاء إدخال كود المنحة أو كود الإحالة' : 'Please enter a grant or referral code');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await onVerify(code);

      if (result.success) {
      } else {
        setError(result.error || (isAr ? 'الكود غير صحيح أو غير مفعل' : 'Invalid or inactive code'));
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء التحقق. حاول مرة أخرى.' : 'Something went wrong while verifying. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="w-full max-w-xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-black text-primary hover:scale-105 transition-transform mb-10"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hero-panel rounded-[2rem] p-6 md:p-8 space-y-8"
        >
          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/15">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="section-title font-black title-font text-primary">
              {isAr ? 'أدخل كود المنحة أو كود الإحالة' : 'Enter Grant or Referral Code'}
            </h2>
            <p className="section-subtitle font-bold">
              {isAr 
                ? '🔒 أدخل كود المنحة أو كود الإحالة لتفعيل خصم المنحة فوراً'
                : '🔒 Enter your grant or referral code to activate the discount'}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="px-2 text-sm font-black text-foreground md:text-base">
                {isAr ? 'الكود' : 'Code'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder={isAr ? 'أدخل كود المنحة أو الإحالة' : 'Enter your grant/referral code'}
                  className="field-shell w-full rounded-[1.5rem] px-7 py-5 text-center text-2xl font-black uppercase tracking-[0.28em] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 md:text-[2rem]"
                  dir="ltr"
                />
                {code && (
                  <button
                    onClick={() => setCode('')}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm font-black text-destructive md:text-base"
              >
                {error}
              </motion.p>
            )}
            
            <button
              onClick={handleVerify}
              disabled={loading}
              className="action-primary flex w-full items-center justify-center gap-3 rounded-[1.5rem] py-5 text-lg font-black disabled:opacity-50 md:text-xl"
            >
              {loading ? (
                <span className="animate-pulse">{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
              ) : (
                <>
                  {isAr ? 'تفعيل المنحة الآن' : 'Activate Grant Now'}
                  <Check className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
          
          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border border-dashed" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-5 bg-card/80 text-muted-foreground font-black text-sm md:text-base">
                {isAr ? 'أو' : 'Or'}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={() => setShowRequestForm((prev) => !prev)}
              className="action-secondary w-full rounded-[1.4rem] py-4 text-base font-black hover:border-primary/40 md:text-lg"
            >
              {isAr ? 'التقديم على طلب كود' : 'Apply for a Code'}
            </button>

            {showRequestForm && (
              <div className="glass-panel rounded-[1.75rem] p-5 text-right space-y-4">
                <h3 className="text-lg font-black text-primary title-font text-center md:text-xl">
                  {isAr ? 'طلب كود جديد' : 'Request a New Code'}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black md:text-sm">
                    <User className="w-4 h-4 text-primary" />
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={requestData.fullName}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="field-shell w-full rounded-2xl px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder={isAr ? 'اكتب اسمك الكامل' : 'Enter your full name'}
                  />
                  {requestErrors.fullName && <p className="text-sm text-destructive font-bold">{requestErrors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black md:text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={requestData.phone}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="field-shell w-full rounded-2xl px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                  {requestErrors.phone && <p className="text-sm text-destructive font-bold">{requestErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black md:text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={requestData.email}
                    onChange={(e) => setRequestData((prev) => ({ ...prev, email: e.target.value }))}
                    className="field-shell w-full rounded-2xl px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder={isAr ? 'name@example.com' : 'name@example.com'}
                    dir="ltr"
                  />
                  {requestErrors.email && <p className="text-sm text-destructive font-bold">{requestErrors.email}</p>}
                </div>
                <button
                  onClick={handleCodeRequest}
                  className="action-primary w-full rounded-2xl py-4 text-base font-black md:text-lg"
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
            
            <p className="text-center text-sm text-muted-foreground font-bold md:text-base">
              {isAr 
                ? 'يمكنك أيضًا متابعة التسجيل بدون كود إذا لم تكن لديك منحة حالية.'
                : 'You can also continue without a code if you do not have an active grant.'}
            </p>

            <button
              onClick={onSkip}
              className="action-secondary w-full rounded-2xl py-4 text-base font-black text-primary hover:border-primary/35 hover:bg-primary/10 md:text-lg"
            >
              {isAr ? 'متابعة بدون كود' : 'Continue Without a Code'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
