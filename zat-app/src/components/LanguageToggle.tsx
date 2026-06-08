'use client';

interface LanguageToggleProps {
  lang: 'ar' | 'en';
  onToggle: (lang: 'ar' | 'en') => void;
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onToggle(lang === 'ar' ? 'en' : 'ar')}
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent hover:bg-accent/80 transition-colors"
    >
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
}
