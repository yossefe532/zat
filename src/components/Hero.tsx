'use client';

import { ArrowLeft, ShieldCheck, Sparkles, Target, Trophy, WalletCards } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  lang: 'ar' | 'en';
  onStart: () => void;
}

export function Hero({ lang, onStart }: HeroProps) {
  const isAr = lang === 'ar';

  const valueCards = [
    {
      icon: Target,
      title: isAr ? 'اختر مسارك بسرعة' : 'Choose Faster',
      description: isAr
        ? 'واجهة أوضح تساعدك تختار المسار المناسب بدون حيرة أو لف كثير.'
        : 'A clearer flow helps you choose the right learning path without confusion.',
    },
    {
      icon: WalletCards,
      title: isAr ? 'افهم القيمة قبل السعر' : 'Value Before Price',
      description: isAr
        ? 'اعرف النتيجة والخطة ونظام الدعم أولًا، ثم اختر الباقة الأنسب لك.'
        : 'See the outcome, plan, and support first, then choose the best package.',
    },
    {
      icon: ShieldCheck,
      title: isAr ? 'تسجيل واضح ومباشر' : 'Clear Registration',
      description: isAr
        ? 'خطوات مختصرة، سعر موحد للمنحة، ورسالة تأكيد نهائية بدون تشتيت.'
        : 'Short steps, a unified grant price, and a distraction-free final confirmation.',
    },
  ];

  const trustPoints = [
    isAr ? 'مناسب للمبتدئين ومن يريد خطة واضحة' : 'Suitable for beginners and guided learners',
    isAr ? 'سعر المنحة الحالي موحد بوضوح على الكورسات' : 'The active grant price is clearly unified across courses',
    isAr ? 'يمكنك اختيار أكثر من كورس ومعرفة التوفير فورًا' : 'You can combine courses and see savings instantly',
    isAr ? 'تأكيد الحجز النهائي يتم في آخر خطوة فقط' : 'Final reservation confirmation happens only at the last step',
  ];

  const quickSteps = [
    {
      step: isAr ? '01' : '01',
      label: isAr ? 'فعّل المنحة أو تابع مباشرة' : 'Activate grant or continue directly',
    },
    {
      step: isAr ? '02' : '02',
      label: isAr ? 'اختر الكورسات أو المسار الأنسب' : 'Choose the best courses or path',
    },
    {
      step: isAr ? '03' : '03',
      label: isAr ? 'أكمل التسجيل واحجز مكانك' : 'Complete registration and reserve your spot',
    },
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-5 py-2 text-xs font-extrabold text-primary shadow-sm backdrop-blur-md md:text-sm">
            <Sparkles className="h-4 w-4" />
            {isAr ? 'مبادرة ذات التعليمية 2026 🎓' : 'ZAT Educational Initiative 2026 🎓'}
          </div>

          <div className="mx-auto max-w-3xl rounded-full border border-primary/15 bg-primary/8 px-5 py-3 text-center text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
            {isAr
              ? 'التقديم الحالي مفتوح الآن، ويمكنك معرفة السعر النهائي والتوفير مباشرة قبل تأكيد التسجيل.'
              : 'Registration is currently open, and you can see your final price and savings before confirming.'}
          </div>
          
          <h1 className="section-title mx-auto max-w-4xl font-black text-primary">
            {isAr ? 'ابدأ مسارك التعليمي' : 'Start Your Learning Path'}
            <br />
            <span className="text-foreground">{isAr ? 'بوضوح وسرعة وثقة' : 'With Clarity, Speed, and Confidence'}</span>
          </h1>
          
          <p className="section-subtitle mx-auto max-w-3xl font-bold">
            {isAr 
              ? 'اختَر الكورس أو المسار المناسب لك، اعرف فائدته الفعلية قبل السعر، ثم أكمل تسجيلك بخطوات مختصرة وواضحة.'
              : 'Choose the course or learning path that fits you, understand its value before the price, and complete your registration through a short, clear flow.'}
          </p>

          <div className="grid gap-4 text-right md:grid-cols-3 md:text-center">
            {valueCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.45 }}
                className="glass-panel flex flex-col gap-3 rounded-[1.5rem] p-5"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-foreground md:text-lg">{card.title}</h3>
                <p className="text-sm font-bold leading-7 text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="hero-panel mx-auto max-w-4xl rounded-[1.75rem] p-5 text-right md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 md:max-w-xl">
                <h3 className="text-lg font-black text-primary md:text-xl">
                  {isAr ? 'لماذا يبدأ الناس التسجيل هنا بسرعة؟' : 'Why do visitors register faster here?'}
                </h3>
                <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                  {isAr
                    ? 'لأنك ترى النتيجة التي ستحصل عليها، وتعرف طريقة التسجيل، وتستوعب التوفير المتاح قبل أي خطوة نهائية.'
                    : 'Because you see the expected outcome, understand the process, and know your savings before any final action.'}
                </p>
              </div>
              <div className="grid gap-2 md:min-w-[18rem]">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-black text-foreground backdrop-blur-sm"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <ComparisonSection lang={lang} />
          </div>
          
          <div className="grid gap-4 pt-8 md:grid-cols-3">
            {quickSteps.map((item) => (
              <div
                key={`${item.step}-${item.label}`}
                className="metric-card flex items-center gap-4 rounded-[1.5rem] p-4 text-right"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">
                  {item.step}
                </div>
                <p className="text-sm font-black leading-6 text-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={onStart}
              className="action-primary group relative inline-flex items-center justify-center gap-3 rounded-3xl px-10 py-4 text-lg font-black"
            >
              🚀 {isAr ? 'ابدأ التسجيل الآن' : 'Start Registration Now'}
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
            </button>
            <button
              onClick={onStart}
              className="action-secondary inline-flex items-center justify-center gap-3 rounded-3xl px-8 py-4 text-base font-black text-foreground hover:border-primary/35 hover:text-primary"
            >
              <Trophy className="h-5 w-5 text-primary" />
              {isAr ? 'اعرف أفضل مسار لك' : 'Find Your Best Path'}
            </button>
          </div>

          <div className="grid max-w-3xl grid-cols-1 gap-5 pt-12 mx-auto md:grid-cols-3">
            {[
              {
                text: isAr ? 'سعر واضح قبل الدفع' : 'Clear pricing before payment',
                highlight: isAr ? 'اعرف الإجمالي والتقسيط' : 'Know the total and installments',
              },
              {
                text: isAr ? 'اختيار أسهل من الأول' : 'Easier course selection',
                highlight: isAr ? 'قارن وأضف كورسات بسرعة' : 'Compare and add faster',
              },
              {
                text: isAr ? 'تسجيل نهائي منظم' : 'Organized final confirmation',
                highlight: isAr ? 'الحجز يتأكد في آخر خطوة' : 'Confirmation only at the final step',
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-panel flex flex-col items-center gap-2 rounded-[1.75rem] p-5 text-center group hover:border-primary/40"
              >
                <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Trophy className="h-5 w-5" />
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
