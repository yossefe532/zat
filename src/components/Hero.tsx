'use client';

import { ArrowLeft, Sparkles, Trophy, Clock, Users } from 'lucide-react';

interface HeroProps {
  lang: 'ar' | 'en';
  onStart: () => void;
}

export function Hero({ lang, onStart }: HeroProps) {
  const isAr = lang === 'ar';
  
  const features = [
    { icon: Trophy, text: isAr ? 'أسعار تنافسية' : 'Competitive Prices', highlight: isAr ? 'حتى 80% خصم' : 'Up to 80% off' },
    { icon: Clock, text: isAr ? 'إمكانية التقسيط' : 'Installment Plans', highlight: isAr ? 'بدون فوائد' : 'Interest-free' },
    { icon: Users, text: isAr ? 'مدرسون معتمدون' : 'Certified Instructors', highlight: isAr ? 'خبرة 5+ سنوات' : '5+ years experience' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            {isAr ? 'مبادرة تعليمية جديدة' : 'New Educational Initiative'}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fadeIn stagger-1" style={{ opacity: 0 }}>
            {isAr ? 'تعلّم مهارات' : 'Learn Skills'}
            <br />
            <span className="text-primary">{isAr ? 'المستقبل' : 'for the Future'}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fadeIn stagger-2" style={{ opacity: 0 }}>
            {isAr 
              ? 'دورات تدريبية في اللغات والبرمجة والتصميم بأسعار رمزية بدعم من مبادرة ذات'
              : 'Training courses in languages, programming, and design at symbolic prices with ZAT initiative support'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto animate-fadeIn stagger-3" style={{ opacity: 0 }}>
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border">
                <feature.icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
                <span className="text-sm font-semibold text-primary">{feature.highlight}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn stagger-4" style={{ opacity: 0 }}>
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
            >
              {isAr ? 'ابدأ الآن' : 'Start Now'}
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
          
          <div className="pt-8 animate-fadeIn stagger-5" style={{ opacity: 0 }}>
            <ComparisonSection lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection({ lang }: { lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar';
  
  return (
    <div className="bg-card rounded-2xl border p-6 max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">{isAr ? 'لماذا مبادرة ذات؟' : 'Why ZAT?'}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2 px-2">{isAr ? 'الميزة' : 'Feature'}</th>
              <th className="text-center py-2 px-2 text-muted-foreground">{isAr ? 'المنافسين' : 'Others'}</th>
              <th className="text-center py-2 px-2 text-primary">{isAr ? 'ذات' : 'ZAT'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-2">{isAr ? 'سعر الكورس' : 'Course Price'}</td>
              <td className="text-center py-2 px-2 text-muted-foreground">3000 {isAr ? 'جنيه' : 'EGP'}</td>
              <td className="text-center py-2 px-2 text-primary font-semibold">650 {isAr ? 'جنيه' : 'EGP'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-2">{isAr ? 'إمكانية التقسيط' : 'Installments'}</td>
              <td className="text-center py-2 px-2 text-muted-foreground">❌</td>
              <td className="text-center py-2 px-2 text-primary">✅</td>
            </tr>
            <tr>
              <td className="py-2 px-2">{isAr ? 'شهادات معتمدة' : 'Certified Diplomas'}</td>
              <td className="text-center py-2 px-2 text-muted-foreground">✅</td>
              <td className="text-center py-2 px-2 text-primary">✅</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
