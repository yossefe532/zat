'use client';

import { ArrowLeft, Trophy, Clock, Users } from 'lucide-react';
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
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="inline-block rounded-full border border-primary/15 bg-card/70 px-5 py-2 text-xs font-extrabold text-primary shadow-sm backdrop-blur-md md:text-sm">
            {isAr ? 'مبادرة ذات التعليمية 2026 🎓' : 'ZAT Educational Initiative 2026 🎓'}
          </div>
          
          <h1 className="section-title mx-auto max-w-4xl font-black text-primary">
            {isAr ? 'مستقبلك يبدأ هنا..' : 'Your Future Starts Here..'}
            <br />
            <span className="text-foreground">{isAr ? 'بخطوات واثقة' : 'With Confidence'}</span>
          </h1>
          
          <p className="section-subtitle mx-auto max-w-3xl font-bold">
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
              className="action-primary group relative inline-flex items-center justify-center gap-3 rounded-3xl px-10 py-4 text-lg font-black"
            >
              🚀 {isAr ? 'ابدأ رحلة التعلم الآن' : 'Start Learning Now'}
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid max-w-3xl grid-cols-1 gap-5 pt-12 mx-auto md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-panel flex flex-col items-center gap-2 rounded-[1.75rem] p-5 text-center group hover:border-primary/40"
              >
                <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground md:text-sm">{feature.text}</span>
                <span className="text-sm font-black text-primary md:text-base">{feature.highlight}</span>
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
    <div className="table-shell mx-auto max-w-3xl rounded-[2rem]">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-4 px-5 text-right text-sm font-black md:text-base">{isAr ? 'لماذا مبادرة ZAT؟' : 'Why ZAT?'}</th>
            <th className="py-4 px-5 text-sm font-black md:text-base">{isAr ? 'مبادرة ZAT' : 'ZAT'}</th>
            <th className="py-4 px-5 text-sm font-black text-white/85 md:text-base">{isAr ? 'المنافسين' : 'Others'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {[
            { featureAr: 'السعر التنافسي والأفضل', featureEn: 'Competitive & Best Price', zat: true, others: false },
            { featureAr: 'مستوى تعليم رفيع وعالي الجودة', featureEn: 'High-Quality Education', zat: true, others: false },
            { featureAr: 'نظام التعلم (Online & Offline)', featureEn: 'Online & Offline Learning', zat: true, others: false },
            { featureAr: 'دعم فني ومتابعة مستمرة', featureEn: 'Continuous Support', zat: true, others: false },
          ].map((row, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors">
              <td className="bg-muted/35 py-4 px-5 text-right text-sm font-black text-foreground md:text-base">
                {isAr ? row.featureAr : row.featureEn}
              </td>
              <td className="py-4 px-5 text-xl font-black text-success md:text-2xl">✔</td>
              <td className="py-4 px-5 text-xl font-black text-destructive/80 md:text-2xl">✘</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
