'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface QuizResult {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  reasonsAr: string[];
  reasonsEn: string[];
  recommendedCourseIds: number[];
}

interface PathQuizProps {
  lang: 'ar' | 'en';
  onBack: () => void;
  onSkip: () => void;
  onComplete: (result: QuizResult) => void;
}

type Question = {
  id: string;
  promptAr: string;
  promptEn: string;
  helperAr: string;
  helperEn: string;
  options: Array<{
    value: string;
    labelAr: string;
    labelEn: string;
    boost: number[];
  }>;
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'goal',
    promptAr: 'ما الهدف الأقرب لك الآن؟',
    promptEn: 'What is your main goal right now?',
    helperAr: 'اختيار الهدف يساعدنا نرشح لك البداية الأنسب بدل التشتت بين كل الكورسات.',
    helperEn: 'Your goal helps us recommend the best start instead of browsing every course.',
    options: [
      { value: 'language', labelAr: 'أريد تحسين لغتي', labelEn: 'I want to improve my language', boost: [1, 2] },
      { value: 'job', labelAr: 'أريد مهارة مفيدة للشغل', labelEn: 'I want a job-ready skill', boost: [3, 1] },
      { value: 'creative', labelAr: 'أريد مجالًا إبداعيًا', labelEn: 'I want a creative field', boost: [5, 4] },
      { value: 'tech', labelAr: 'أريد الدخول في التقنية', labelEn: 'I want to enter tech', boost: [6, 3] },
    ],
  },
  {
    id: 'level',
    promptAr: 'ما مستوى البداية المناسب لك؟',
    promptEn: 'What starting level fits you best?',
    helperAr: 'اختر الواقع الحالي، وليس المستوى الذي تتمنى الوصول إليه.',
    helperEn: 'Choose your real current level, not the level you wish to reach.',
    options: [
      { value: 'beginner', labelAr: 'أنا مبتدئ تمامًا', labelEn: 'I am a complete beginner', boost: [1, 2, 3, 6] },
      { value: 'guided', labelAr: 'أحتاج مسارًا واضحًا وخطوات مرتبة', labelEn: 'I need a guided path', boost: [3, 1, 6] },
      { value: 'applied', labelAr: 'أفضل التعلم العملي والتطبيق', labelEn: 'I prefer practical learning', boost: [4, 5, 6] },
    ],
  },
  {
    id: 'time',
    promptAr: 'كم وقتًا يمكنك تخصيصه أسبوعيًا؟',
    promptEn: 'How much time can you dedicate weekly?',
    helperAr: 'نستخدم الوقت المتاح لتحديد ما إذا كنت تحتاج بداية خفيفة أو مسارًا أوسع.',
    helperEn: 'Your available time helps us choose a lighter or broader starting path.',
    options: [
      { value: 'light', labelAr: 'وقت محدود وأريد بداية سهلة', labelEn: 'Limited time, easy start', boost: [1, 2, 3] },
      { value: 'medium', labelAr: 'لدي وقت مناسب للتدرج', labelEn: 'I have time for a steady path', boost: [1, 3, 5, 6] },
      { value: 'intensive', labelAr: 'أستطيع الالتزام بمسار أقوى', labelEn: 'I can commit to a stronger path', boost: [4, 5, 6] },
    ],
  },
  {
    id: 'style',
    promptAr: 'أي نوع من التعلم يشجعك أكثر؟',
    promptEn: 'Which learning style motivates you most?',
    helperAr: 'نختار لك الكورس الأقرب لطريقة التعلم التي ستكمل فيها فعلًا.',
    helperEn: 'We recommend the option that best matches the way you actually like to learn.',
    options: [
      { value: 'communication', labelAr: 'محادثة وتواصل', labelEn: 'Communication and conversation', boost: [1, 2] },
      { value: 'office', labelAr: 'مهارات عملية وسوق عمل', labelEn: 'Practical office skills', boost: [3, 1] },
      { value: 'visual', labelAr: 'تصميم وصناعة محتوى', labelEn: 'Design and visual content', boost: [5, 4] },
      { value: 'building', labelAr: 'إنشاء مواقع ومشاريع', labelEn: 'Building websites and projects', boost: [6, 3] },
    ],
  },
];

const COURSE_LABELS = {
  1: { ar: 'كورس الإنجليزي', en: 'English Course' },
  2: { ar: 'كورس الألماني', en: 'German Course' },
  3: { ar: 'كورس ICDL', en: 'ICDL Course' },
  4: { ar: 'كورس الموشن جرافيك', en: 'Motion Graphics Course' },
  5: { ar: 'كورس الفوتوشوب', en: 'Photoshop Course' },
  6: { ar: 'كورس البرمجة', en: 'Programming Course' },
} as const;

function buildQuizResult(answers: Record<string, string>): QuizResult {
  const scores = new Map<number, number>();

  QUIZ_QUESTIONS.forEach((question) => {
    const answer = question.options.find((option) => option.value === answers[question.id]);
    answer?.boost.forEach((courseId, index) => {
      const previous = scores.get(courseId) ?? 0;
      scores.set(courseId, previous + (index === 0 ? 3 : 2));
    });
  });

  const recommendedCourseIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([courseId]) => courseId);

  const [primaryCourseId, secondaryCourseId] = recommendedCourseIds;

  const reasonsAr = [
    answers.goal === 'language'
      ? 'اخترت هدفًا مرتبطًا باللغة، لذلك رشحنا لك مسارًا يرفع التواصل والمحادثة بسرعة.'
      : answers.goal === 'job'
        ? 'ركزت على مهارة عملية مفيدة للشغل، لذلك قدمنا لك اختيارًا أقرب لسوق العمل.'
        : answers.goal === 'creative'
          ? 'ميولك الإبداعية واضحة، لذلك رشحنا لك كورسات تصميم ومحتوى مرئية أكثر.'
          : 'تميل إلى المسار التقني، لذلك بدأنا مع كورسات تبني لك أساسًا رقميًا عمليًا.',
    answers.level === 'beginner'
      ? 'بما أنك تبدأ من الصفر، اخترنا لك نقطة دخول أسهل وأوضح لتضمن الاستمرار.'
      : answers.level === 'guided'
        ? 'أنت تحتاج خطوات مرتبة وواضحة، لذلك فضّلنا مسارًا منظمًا بدل الخيارات المفتوحة.'
        : 'أنت تميل إلى التطبيق العملي، لذلك التوصية الحالية أكثر اعتمادًا على التنفيذ والمشروعات.',
    answers.time === 'light'
      ? 'وقتك محدود حاليًا، لذا اخترنا بداية تعطيك نتيجة سريعة بدون ضغط كبير.'
      : answers.time === 'medium'
        ? 'لديك وقت مناسب للتدرج، لذلك جمعنا لك خيارًا أساسيًا مع خيار مكمل ذكي.'
        : 'لديك قابلية للالتزام الأعلى، لذا أضفنا لك مسارًا أقوى يمكنه تسريع النتيجة.',
  ];

  const reasonsEn = [
    answers.goal === 'language'
      ? 'You chose a language-focused goal, so we recommended a path that improves communication quickly.'
      : answers.goal === 'job'
        ? 'You focused on a practical job-ready skill, so we prioritized the most career-relevant option.'
        : answers.goal === 'creative'
          ? 'Your creative direction is clear, so we recommended more visual design-oriented courses.'
          : 'You are leaning toward tech, so we started with courses that build a practical digital foundation.',
    answers.level === 'beginner'
      ? 'Since you are starting from scratch, we picked an easier and clearer entry point.'
      : answers.level === 'guided'
        ? 'You need a structured path, so we favored a guided route over open-ended options.'
        : 'You prefer hands-on learning, so this recommendation leans more toward implementation and projects.',
    answers.time === 'light'
      ? 'Your time is limited, so we chose a start that gives you value without overload.'
      : answers.time === 'medium'
        ? 'You have enough time for steady progress, so we paired a core option with a smart companion course.'
        : 'You can commit more strongly, so we added a stronger path that can accelerate your results.',
  ];

  const primaryCourse = primaryCourseId ? COURSE_LABELS[primaryCourseId as keyof typeof COURSE_LABELS] : COURSE_LABELS[1];
  const secondaryCourse = secondaryCourseId ? COURSE_LABELS[secondaryCourseId as keyof typeof COURSE_LABELS] : COURSE_LABELS[3];

  return {
    titleAr: `المسار الأنسب لك يبدأ بـ ${primaryCourse.ar}`,
    titleEn: `Your best path starts with ${primaryCourse.en}`,
    subtitleAr: `ونرشح لك أيضًا ${secondaryCourse.ar} كخيار مكمل إذا أردت نتيجة أقوى.`,
    subtitleEn: `We also recommend ${secondaryCourse.en} as a smart companion option for stronger results.`,
    reasonsAr,
    reasonsEn,
    recommendedCourseIds,
  };
}

export function PathQuiz({ lang, onBack, onSkip, onComplete }: PathQuizProps) {
  const isAr = lang === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) return;

    if (currentIndex === QUIZ_QUESTIONS.length - 1) {
      onComplete(buildQuizResult(answers));
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      onBack();
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <section className="min-h-screen bg-background px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={handlePrevious}
          className="mb-8 inline-flex items-center gap-2 text-sm font-black text-primary transition-transform hover:scale-105"
        >
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
          {isAr ? 'العودة' : 'Back'}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hero-panel space-y-8 rounded-[2rem] p-6 text-right md:p-8"
        >
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
              <Compass className="h-4 w-4" />
              {isAr ? 'اختبار تحديد المسار' : 'Path Finder Quiz'}
            </div>

            <h2 className="section-title font-black text-primary">
              {isAr ? 'جاوب 4 أسئلة ونرشح لك أفضل بداية' : 'Answer 4 questions and get your best start'}
            </h2>

            <p className="section-subtitle mx-auto max-w-2xl font-bold">
              {isAr
                ? 'اختبار سريع يساعدك تختار الكورس أو المسار الأنسب حسب هدفك ووقتك وطريقة التعلم التي تفضّلها.'
                : 'A quick quiz that recommends the best course or path based on your goal, time, and learning style.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-muted-foreground md:text-sm">
              <span>{isAr ? `السؤال ${currentIndex + 1} من ${QUIZ_QUESTIONS.length}` : `Question ${currentIndex + 1} of ${QUIZ_QUESTIONS.length}`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="glass-panel space-y-6 rounded-[1.75rem] p-5 md:p-6">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-foreground md:text-2xl">
                {isAr ? currentQuestion.promptAr : currentQuestion.promptEn}
              </h3>
              <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                {isAr ? currentQuestion.helperAr : currentQuestion.helperEn}
              </p>
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`glass-panel flex items-center justify-between gap-4 rounded-[1.5rem] p-4 text-right transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/8 shadow-lg'
                        : 'hover:border-primary/35 hover:bg-card/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground md:text-base">
                        {isAr ? option.labelAr : option.labelEn}
                      </p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card/70 text-muted-foreground'
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onSkip}
              className="action-secondary inline-flex items-center justify-center gap-2 rounded-3xl px-6 py-3 text-sm font-black text-foreground hover:border-primary/35 hover:text-primary"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {isAr ? 'تخطي الاختبار ومتابعة الخطوات' : 'Skip the quiz and continue'}
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="action-primary inline-flex items-center justify-center gap-3 rounded-3xl px-8 py-4 text-base font-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentIndex === QUIZ_QUESTIONS.length - 1
                ? (isAr ? 'اعرض النتيجة الآن' : 'Show My Result')
                : (isAr ? 'السؤال التالي' : 'Next Question')}
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
