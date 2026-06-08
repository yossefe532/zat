'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Phone, Calendar, AlertCircle, Check } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface RegistrationFormProps {
  lang: 'ar' | 'en';
  selectedCourses: Course[];
  grantCode: string;
  grantData: { nameAr: string; nameEn: string; whatsappNumber: string } | null;
  calculations: {
    subtotal: number;
    discount: number;
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  onBack: () => void;
  onSubmit: (data: { fullName: string; phone: string; age: number }) => void;
}

export function RegistrationForm({
  lang,
  selectedCourses,
  grantCode,
  grantData,
  calculations,
  onBack,
  onSubmit
}: RegistrationFormProps) {
  const isAr = lang === 'ar';
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    age: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = isAr ? 'الرجاء إدخال الاسم الكامل' : 'Please enter full name';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = isAr ? 'الرجاء إدخال رقم الهاتف' : 'Please enter phone number';
    } else if (!/^01[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = isAr ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    
    if (!formData.age) {
      newErrors.age = isAr ? 'الرجاء إدخال العمر' : 'Please enter age';
    } else {
      const ageNum = parseInt(formData.age);
      if (ageNum < 10 || ageNum > 100) {
        newErrors.age = isAr ? 'العمر يجب أن يكون بين 10 و 100' : 'Age must be between 10 and 100';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit({
      fullName: formData.fullName,
      phone: formData.phone,
      age: parseInt(formData.age)
    });
    setLoading(false);
  };

  return (
    <section className="min-h-[80vh] px-4 py-16">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          {isAr ? 'العودة' : 'Back'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold">
            {isAr ? 'بيانات التسجيل' : 'Registration Details'}
          </h2>
          <p className="text-muted-foreground">
            {isAr 
              ? 'أدخل بياناتك لإتمام عملية التسجيل'
              : 'Enter your details to complete registration'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              {isAr ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              className={`w-full px-4 py-3 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.fullName ? 'border-destructive' : 'border-border focus:border-primary'
              }`}
            />
            {errors.fullName && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.fullName}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {isAr ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="01xxxxxxxxx"
              className={`w-full px-4 py-3 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.phone ? 'border-destructive' : 'border-border focus:border-primary'
              }`}
              dir="ltr"
            />
            {errors.phone && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {isAr ? 'العمر' : 'Age'}
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => {
                setFormData({ ...formData, age: e.target.value });
                if (errors.age) setErrors({ ...errors, age: '' });
              }}
              placeholder={isAr ? 'أدخل عمرك' : 'Enter your age'}
              min="10"
              max="100"
              className={`w-full px-4 py-3 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.age ? 'border-destructive' : 'border-border focus:border-primary'
              }`}
            />
            {errors.age && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.age}
              </p>
            )}
          </div>
          
          <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
            <h4 className="font-semibold">{isAr ? 'ملخص الطلب' : 'Order Summary'}</h4>
            
            <div className="flex flex-wrap gap-2">
              {selectedCourses.map((course) => (
                <span key={course.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <span>{course.icon}</span>
                  <span>{isAr ? course.nameAr : course.nameEn}</span>
                </span>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="font-bold">{formatPrice(calculations.total)} {isAr ? 'جنيه' : 'EGP'}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>{isAr ? 'القسط الأول' : '1st Installment'}</span>
                <span className="font-semibold">{formatPrice(calculations.firstInstallment)} {isAr ? 'جنيه' : 'EGP'}</span>
              </div>
            </div>
          </div>
          
          {grantData && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm">
                <Check className="w-4 h-4 inline-block ml-1 text-success" />
                {isAr ? 'تم تطبيق خصم المنحة' : 'Grant discount applied'}
                <span className="font-semibold mr-1">
                  {grantData.nameAr}
                </span>
              </p>
            </div>
          )}
          
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
            <p className="text-sm text-warning-foreground">
              <AlertCircle className="w-4 h-4 inline-block ml-1" />
              {isAr 
                ? 'صلاحية الكود 3 أيام من تاريخ التسجيل'
                : 'Code validity: 3 days from registration date'}
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">{isAr ? 'جارٍ التسجيل...' : 'Registering...'}</span>
            ) : (
              <>
                {isAr ? 'إتمام التسجيل' : 'Complete Registration'}
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
