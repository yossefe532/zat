'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Gift, X, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeGateProps {
  lang: 'ar' | 'en';
  onVerify: (code: string) => boolean;
  onBack: () => void;
  onSkip: () => void;
}

export function CodeGate({ lang, onVerify, onBack, onSkip }: CodeGateProps) {
  const isAr = lang === 'ar';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(isAr ? 'الرجاء إدخال كود المنحة' : 'Please enter grant code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (onVerify(code)) {
      // Success
    } else {
      setError(isAr ? 'الكود غير صحيح أو غير مفعل' : 'Invalid or inactive code');
    }
    
    setLoading(false);
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
                  placeholder={isAr ? 'أدخل الكود هنا (مثلاً: Y.EDU)' : 'Enter code here (e.g., Y.EDU)'}
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
              onClick={onSkip}
              className="w-full py-5 rounded-2xl border-2 border-border bg-background text-foreground font-black text-xl hover:bg-muted/50 transition-all hover:border-primary/50"
            >
              {isAr ? 'ليس لدي كود منحة' : "I don't have a code"}
            </button>
            
            <p className="text-center text-base text-muted-foreground font-bold">
              {isAr 
                ? '💡 يمكنك الاستمرار والتسجيل بالسعر الأصلي (3000 ج)'
                : '💡 You can continue and register at the original price (3000 EGP)'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
