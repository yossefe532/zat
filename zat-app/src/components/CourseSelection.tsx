'use client';

import { ArrowRight, ArrowLeft, Check, GraduationCap } from 'lucide-react';
import { Course } from '@/lib/types';

interface CourseSelectionProps {
  lang: 'ar' | 'en';
  courses: Course[];
  selectedCourses: Course[];
  onToggle: (course: Course) => void;
  onBack: () => void;
  onContinue: () => void;
  grantData: { nameAr: string; nameEn: string } | null;
}

export function CourseSelection({
  lang,
  courses,
  selectedCourses,
  onToggle,
  onBack,
  onContinue,
  grantData
}: CourseSelectionProps) {
  const isAr = lang === 'ar';
  const price = grantData ? 650 : 3000;
  const priceLabel = grantData 
    ? (isAr ? 'سعر المنحة' : 'Grant Price')
    : (isAr ? 'السعر الكامل' : 'Full Price');

  return (
    <section className="min-h-[80vh] px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          {isAr ? 'العودة' : 'Back'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {isAr ? 'اختر دوراتك التدريبية' : 'Choose Your Courses'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isAr 
              ? 'اختر الدورة أو الدورات التي تناسبك. يمكنك اختيار أكثر من دورة.'
              : 'Choose the course or courses that suit you. You can select multiple courses.'}
          </p>
          
          {grantData && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm">
              <Check className="w-4 h-4" />
              {isAr ? `سعر خاص لمنحة ${grantData.nameAr}` : `Special price for ${grantData.nameEn} Grant`}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            const isSelected = selectedCourses.find(c => c.id === course.id);
            return (
              <div
                key={course.id}
                onClick={() => onToggle(course)}
                className={`
                  relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }
                  animate-fadeIn stagger-${index + 1}
                `}
                style={{ opacity: 0 }}
              >
                <div className="absolute top-4 left-4 text-4xl">{course.icon}</div>
                
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className="pt-12 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {isAr ? course.nameAr : course.nameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground">{course.level}</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground min-h-[40px]">
                    {isAr ? course.benefitAr : course.benefitEn}
                  </p>
                  
                  <div className="flex items-baseline gap-2 pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">{price}</span>
                    <span className="text-muted-foreground">{isAr ? 'جنيه' : 'EGP'}</span>
                    {!grantData && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        3000
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <p className="text-muted-foreground">
              {isAr ? 'الدورات المختارة' : 'Selected Courses'}: 
              <span className="font-bold text-foreground mr-2">{selectedCourses.length}</span>
            </p>
            {selectedCourses.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {isAr ? 'إجمالي' : 'Total'}: {selectedCourses.length * price} {isAr ? 'جنيه' : 'EGP'}
              </p>
            )}
          </div>
          
          <button
            onClick={onContinue}
            disabled={selectedCourses.length === 0}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAr ? 'متابعة' : 'Continue'}
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
