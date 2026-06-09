'use client';

interface LanguageToggleProps {
  lang: 'ar' | 'en';
  onToggle: (lang: 'ar' | 'en') => void;
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={() => onToggle(lang === 'ar' ? 'en' : 'ar')}
      className="action-secondary rounded-2xl px-4 py-2 text-xs font-black text-primary hover:border-primary/40 hover:bg-primary/10 md:text-sm"
    >
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
}
