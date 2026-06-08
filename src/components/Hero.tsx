'use client';

import { ArrowLeft, Sparkles, Trophy, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Legacy background effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90')] bg-cover bg-center" />
      
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-full font-extrabold text-sm mb-4 animate-pulse">
            {isAr ? 'مبادرة ذات التعليمية 2026 🎓' : 'ZAT Educational Initiative 2026 🎓'}
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-primary leading-tight">
            {isAr ? 'مستقبلك يبدأ هنا..' : 'Your Future Starts Here..'}
            <br />
            <span className="text-foreground">{isAr ? 'بخطوات واثقة' : 'With Confidence'}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'انضم لأقوى مجتمع تعليمي في مصر، واستمتع بمزايا حصرية لا تقبل المنافسة مع أفضل الخبراء والمدربين المعتمدين.'
              : 'Join the strongest educational community in Egypt and enjoy exclusive competitive advantages with top experts and certified trainers.'}
          </p>

          <div className="pt-8">
            <ComparisonSection lang={lang} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 rounded-xl bg-primary text-primary-foreground font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/30"
            >
              🚀 {isAr ? 'ابدأ رحلة التعلم الآن' : 'Start Learning Now'}
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-12">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary transition-colors group"
              >
                <div className="p-3 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-muted-foreground">{feature.text}</span>
                <span className="text-base font-black text-primary">{feature.highlight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonSection({ lang }: { lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar';
  
  return (
    <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-5 px-6 text-right font-black">{isAr ? 'لماذا مبادرة ZAT؟' : 'Why ZAT?'}</th>
            <th className="py-5 px-6 font-black">{isAr ? 'مبادرة ZAT' : 'ZAT'}</th>
            <th className="py-5 px-6 font-black text-white/70">{isAr ? 'المنافسين' : 'Others'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[
            { featureAr: 'السعر التنافسي والأفضل', featureEn: 'Competitive & Best Price', zat: true, others: false },
            { featureAr: 'مستوى تعليم رفيع وعالي الجودة', featureEn: 'High-Quality Education', zat: true, others: false },
            { featureAr: 'نظام التعلم (Online & Offline)', featureEn: 'Online & Offline Learning', zat: true, others: false },
            { featureAr: 'دعم فني ومتابعة مستمرة', featureEn: 'Continuous Support', zat: true, others: false },
          ].map((row, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors">
              <td className="py-4 px-6 text-right font-bold text-muted-foreground bg-muted/30">
                {isAr ? row.featureAr : row.featureEn}
              </td>
              <td className="py-4 px-6 text-2xl font-black text-success">✔</td>
              <td className="py-4 px-6 text-xl font-black text-destructive opacity-40">✘</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
