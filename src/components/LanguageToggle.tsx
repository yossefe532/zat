'use client';

interface LanguageToggleProps {
  lang: 'ar' | 'en';
  onToggle: (lang: 'ar' | 'en') => void;
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onToggle(lang === 'ar' ? 'en' : 'ar')}
      className="px-4 py-2 rounded-xl text-sm font-black bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20"
    >
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
}
