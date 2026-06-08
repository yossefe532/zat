'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Gift, X, Check } from 'lucide-react';

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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onVerify(code)) {
      // Success - parent will handle navigation
    } else {
      setError(isAr ? 'كود غير صحيح أو غير مفعل' : 'Invalid or inactive code');
    }
    
    setLoading(false);
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          {isAr ? 'العودة' : 'Back'}
        </button>
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">
            {isAr ? 'أدخل كود المنحة' : 'Enter Grant Code'}
          </h2>
          <p className="text-muted-foreground">
            {isAr 
              ? 'لديك كود خصم خاص؟ أدخله هنا للحصول على الأسعار المخفضة'
              : 'Have a special discount code? Enter it here to get reduced prices'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={isAr ? 'مثال: Y.EDU' : 'Example: Y.EDU'}
              className="w-full px-4 py-4 text-center text-xl font-mono uppercase rounded-xl border-2 border-border bg-card focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              dir="ltr"
            />
            {code && (
              <button
                onClick={() => setCode('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">{isAr ? 'جارٍ التحقق...' : 'Verifying...'}</span>
            ) : (
              <>
                {isAr ? 'تحقق من الكود' : 'Verify Code'}
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">
              {isAr ? 'أو' : 'Or'}
            </span>
          </div>
        </div>
        
        <button
          onClick={onSkip}
          className="w-full py-4 rounded-xl border-2 border-border bg-card text-foreground font-semibold hover:bg-accent transition-colors"
        >
          {isAr ? 'متابعة بدون كود' : 'Continue Without Code'}
        </button>
        
        <p className="text-center text-sm text-muted-foreground">
          {isAr 
            ? 'لا تملك كود؟ يمكنك التسجيل بالسعر الكامل'
            : "Don't have a code? You can register at full price"}
        </p>
      </div>
    </section>
  );
}
