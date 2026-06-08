'use client';

import { useState, useEffect } from 'react';
import { COURSES, DEFAULT_GRANT_CODES, DISCOUNT_RULES, ADMIN_FEES } from '@/lib/data';
import { Course } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { CodeGate } from '@/components/CodeGate';
import { CourseSelection } from '@/components/CourseSelection';
import { Basket } from '@/components/Basket';
import { RegistrationForm } from '@/components/RegistrationForm';
import { SuccessPage } from '@/components/SuccessPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { generateRegistrationCode, formatPrice } from '@/lib/utils';

type Step = 'hero' | 'code' | 'courses' | 'basket' | 'form' | 'success';

type GrantData = {
  nameAr: string;
  nameEn: string;
  whatsappNumber: string;
  isActive: boolean;
};

export default function Home() {
  const [step, setStep] = useState<Step>('hero');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [grantCode, setGrantCode] = useState<string>('');
  const [grantData, setGrantData] = useState<GrantData | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [registrationData, setRegistrationData] = useState<{
    fullName: string;
    phone: string;
    age: number;
    registrationCode: string;
  } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('zat_lang') as 'ar' | 'en' | null;
    const savedTheme = localStorage.getItem('zat_theme') as 'light' | 'dark' | null;
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('zat_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('zat_theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const verifyGrantCode = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    const codes = DEFAULT_GRANT_CODES as Record<string, GrantData>;
    if (codes[upperCode]) {
      setGrantData(codes[upperCode]);
      setGrantCode(upperCode);
      return true;
    }
    return false;
  };

  const calculateTotal = () => {
    const coursePrice = grantData ? 650 : 3000;
    const subtotal = selectedCourses.length * coursePrice;
    let discount = 0;
    
    for (const rule of DISCOUNT_RULES) {
      if (selectedCourses.length >= rule.count) {
        discount = rule.discount;
      }
    }
    
    const total = subtotal - discount + ADMIN_FEES;
    const firstInstallment = Math.ceil(total * 0.5);
    const secondInstallment = total - firstInstallment;
    
    return { subtotal, discount, total, firstInstallment, secondInstallment };
  };

  const handleCourseToggle = (course: Course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      if (exists) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  };

  const handleRegistration = (data: { fullName: string; phone: string; age: number }) => {
    const code = generateRegistrationCode();
    setRegistrationData({ ...data, registrationCode: code });
    setStep('success');
  };

  const resetFlow = () => {
    setStep('hero');
    setGrantCode('');
    setGrantData(null);
    setSelectedCourses([]);
    setRegistrationData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">ZAT</span>
            <span className="text-muted-foreground">Initiative</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onToggle={setLang} />
            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {step === 'hero' && (
          <Hero 
            lang={lang} 
            onStart={() => setStep('code')} 
          />
        )}
        
        {step === 'code' && (
          <CodeGate 
            lang={lang} 
            onVerify={verifyGrantCode} 
            onBack={() => setStep('hero')}
            onSkip={() => {
              setGrantData(null);
              setGrantCode('');
              setStep('courses');
            }}
          />
        )}
        
        {step === 'courses' && (
          <CourseSelection
            lang={lang}
            courses={COURSES}
            selectedCourses={selectedCourses}
            onToggle={handleCourseToggle}
            onBack={() => setStep('code')}
            onContinue={() => setStep('basket')}
            grantData={grantData}
          />
        )}
        
        {step === 'basket' && (
          <Basket
            lang={lang}
            selectedCourses={selectedCourses}
            grantData={grantData}
            calculations={calculateTotal()}
            onBack={() => setStep('courses')}
            onContinue={() => setStep('form')}
          />
        )}
        
        {step === 'form' && (
          <RegistrationForm
            lang={lang}
            selectedCourses={selectedCourses}
            grantCode={grantCode}
            grantData={grantData}
            calculations={calculateTotal()}
            onBack={() => setStep('basket')}
            onSubmit={handleRegistration}
          />
        )}
        
        {step === 'success' && registrationData && (
          <SuccessPage
            lang={lang}
            registrationData={registrationData}
            selectedCourses={selectedCourses}
            grantData={grantData}
            calculations={calculateTotal()}
            onReset={resetFlow}
          />
        )}
      </main>

      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {lang === 'ar' ? '© 2024 مبادرة ذات - جميع الحقوق محفوظة' : '© 2024 ZAT Initiative - All Rights Reserved'}
        </div>
      </footer>
    </div>
  );
}
