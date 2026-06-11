'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { BookOpenText, ChevronDown, CircleHelp, ExternalLink, Gift, GraduationCap, X } from 'lucide-react';
import { EDUCO_LINKTREE_URL } from '@/lib/site-links';

type FaqItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  questionAr: string;
  questionEn: string;
  answerAr: string[];
  answerEn: string[];
};

const faqItems: FaqItem[] = [
  {
    id: 'registration',
    icon: GraduationCap,
    questionAr: 'كيف أسجل في الموقع خطوة بخطوة؟',
    questionEn: 'How do I register step by step?',
    answerAr: [
      'ابدأ من الصفحة الرئيسية ثم اضغط على زر بدء التسجيل.',
      'أكمل الاختبار السريع أو انتقل مباشرة إلى خطوة إدخال كود المنحة أو كود الإحالة.',
      'اختر الكورسات المناسبة لك، ثم راجع الفاتورة النهائية وتفاصيل الأقساط.',
      'أدخل بياناتك الشخصية في نموذج التسجيل، وبعدها سيظهر لك كود التسجيل النهائي.',
      'في آخر خطوة يتم فتح واتساب لتأكيد الحجز، ويجب إرسال الرسالة لتثبيت مكانك.',
    ],
    answerEn: [
      'Start from the home page and click the registration button.',
      'Complete the quick quiz or go directly to the grant/referral code step.',
      'Choose your courses, then review the final invoice and installment details.',
      'Enter your personal details in the registration form to receive your final registration code.',
      'The last step opens WhatsApp to confirm your booking, and the message must be sent to secure your spot.',
    ],
  },
  {
    id: 'referrals',
    icon: Gift,
    questionAr: 'كيف تعمل الإحالة وكيف أستفيد منها؟',
    questionEn: 'How does the referral system work?',
    answerAr: [
      'بعد التسجيل يمكنك الدخول إلى لوحة الإحالات ومشاركة كودك الخاص مع أصدقائك.',
      'عندما يسجل صديقك باستخدام كودك يحصل هو على خصم الإحالة، ويتم احتساب إحالة جديدة لك.',
      'كلما زاد عدد المسجلين عبر كودك أو عبر المسار الإحالي المرتبط بك، تفتح لك مكافآت إضافية.',
      'عند اكتمال أي مرحلة يمكنك استرداد المكافأة مباشرة من لوحة الإحالات.',
    ],
    answerEn: [
      'After registration, you can open the referral dashboard and share your personal code.',
      'When a friend registers using your code, they receive the referral discount and a new referral is counted for you.',
      'As more students register through your code or your referral chain, more rewards become available.',
      'Once a milestone is reached, you can redeem the reward directly from the referral dashboard.',
    ],
  },
  {
    id: 'platform-services',
    icon: BookOpenText,
    questionAr: 'ما الذي يمكنني فعله داخل المنصة؟',
    questionEn: 'What can I do inside the platform?',
    answerAr: [
      'تصفح الكورسات المتاحة ومقارنة قيمتها وخطواتها بسهولة.',
      'اختيار أكثر من كورس ومعرفة السعر النهائي والخصومات والتقسيط فورًا.',
      'استرجاع كودك ومتابعة مسار خصوماتك والإحالات الخاصة بك بعد التسجيل.',
      'التواصل السريع عبر واتساب لتأكيد الحجز أو طلب الدعم أو الاستفسار عن الكورسات.',
    ],
    answerEn: [
      'Browse available courses and compare their value and learning path easily.',
      'Select multiple courses and instantly see the final price, discounts, and installment plan.',
      'Recover your code and track your discount/referral path after registration.',
      'Contact support quickly via WhatsApp for booking confirmation, help, or course inquiries.',
    ],
  },
  {
    id: 'important-info',
    icon: CircleHelp,
    questionAr: 'ما أهم المعلومات التي يجب أن أعرفها؟',
    questionEn: 'What else should I know?',
    answerAr: [
      'كود التسجيل تكون له مدة صلاحية محددة، لذلك يفضّل إكمال التأكيد بسرعة.',
      'إرسال رسالة واتساب النهائية جزء أساسي من تثبيت الحجز.',
      'رابط إيديكون يجمع كل الروابط المهمة الخاصة بالمنصة ويمكن الرجوع إليه في أي وقت.',
    ],
    answerEn: [
      'Your registration code has a limited validity period, so confirm as soon as possible.',
      'Sending the final WhatsApp message is a required step to lock the booking.',
      'The Educo Linktree contains all important platform links and can be used anytime.',
    ],
  },
];

export function FaqSidebar() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(faqItems[0]?.id ?? 'registration');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncLanguage = () => {
      const nextLang = (window.localStorage.getItem('zat_lang') as 'ar' | 'en' | null) || 'ar';
      setLang(nextLang);
    };

    syncLanguage();
    window.addEventListener('storage', syncLanguage);
    return () => window.removeEventListener('storage', syncLanguage);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(min-width: 1280px)');
    const syncOpenState = () => setOpen(media.matches);
    syncOpenState();
    media.addEventListener('change', syncOpenState);
    return () => media.removeEventListener('change', syncOpenState);
  }, []);

  const isAr = lang === 'ar';
  const activeItem = useMemo(
    () => faqItems.find((item) => item.id === activeId) ?? faqItems[0],
    [activeId],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 z-50 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/95 px-4 py-3 text-sm font-black text-primary shadow-xl backdrop-blur-xl xl:hidden ${
          isAr ? 'left-4' : 'right-4'
        }`}
      >
        <CircleHelp className="h-4 w-4" />
        {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
      </button>

      <aside
        className={`fixed top-20 z-50 w-[min(24rem,calc(100vw-2rem))] transition-all duration-300 ${
          isAr
            ? `${open ? 'left-4' : '-left-[28rem]'}`
            : `${open ? 'right-4' : '-right-[28rem]'}`
        } xl:${isAr ? 'left-4' : 'right-4'} xl:bottom-5`}
        aria-label={isAr ? 'الأسئلة الشائعة' : 'Frequently asked questions'}
      >
        <div className="hero-panel max-h-[calc(100vh-7rem)] overflow-hidden rounded-[2rem] border border-border/80 shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div className="space-y-1 text-right">
              <p className="text-xs font-black text-primary">{isAr ? 'مساعدة سريعة' : 'Quick help'}</p>
              <h2 className="text-base font-black text-foreground md:text-lg">
                {isAr ? 'الأسئلة الشائعة والدليل المختصر' : 'FAQ and quick guide'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="action-secondary inline-flex items-center justify-center rounded-2xl p-2 xl:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid max-h-[calc(100vh-12rem)] gap-4 overflow-y-auto p-4">
            <div className="space-y-2">
              {faqItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = item.id === activeItem?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`flex w-full items-center justify-between rounded-[1.25rem] border px-4 py-3 text-right transition-colors ${
                      isActive
                        ? 'border-primary/30 bg-primary/8 text-primary'
                        : 'border-border/70 bg-card/55 text-foreground hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-black">
                        {isAr ? item.questionAr : item.questionEn}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
            </div>

            {activeItem ? (
              <div className="metric-card rounded-[1.5rem] p-5 text-right">
                <h3 className="text-sm font-black text-primary md:text-base">
                  {isAr ? activeItem.questionAr : activeItem.questionEn}
                </h3>
                <ul className="mt-4 list-disc space-y-2 ps-5 text-sm font-bold leading-7 text-muted-foreground">
                  {(isAr ? activeItem.answerAr : activeItem.answerEn).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <div className="mt-5 rounded-[1.3rem] border border-primary/15 bg-primary/6 p-4">
                  <p className="text-xs font-black text-primary md:text-sm">
                    {isAr ? 'روابط إيديكون الرسمية' : 'Official Educo links'}
                  </p>
                  <a
                    href={EDUCO_LINKTREE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    {isAr ? 'افتح منصة إيديكون' : 'Open Educo Linktree'}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Link
                    href="/referrals/guide"
                    className="action-secondary mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
                  >
                    {isAr ? 'دليل الإحالات الكامل' : 'Full referral guide'}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
