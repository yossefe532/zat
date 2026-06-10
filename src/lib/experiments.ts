const STORAGE_PREFIX = 'zat_experiment_';

export type HeroExperimentVariant = 'direct' | 'guided';

export function getStickyVariant(
  experimentKey: string,
  variants: string[],
  fallback: string
): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const storageKey = `${STORAGE_PREFIX}${experimentKey}`;
  const existing = window.localStorage.getItem(storageKey);

  if (existing && variants.includes(existing)) {
    return existing;
  }

  const assigned = variants[Math.floor(Math.random() * variants.length)] ?? fallback;
  window.localStorage.setItem(storageKey, assigned);
  return assigned;
}
