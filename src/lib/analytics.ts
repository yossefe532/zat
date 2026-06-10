type AnalyticsPayload = Record<string, unknown>;

const STORAGE_KEY = 'zat_analytics_events';

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const event = {
    eventName,
    payload,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown[];
    const next = [...existing, event].slice(-50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore analytics storage failures to keep the funnel resilient.
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Ignore analytics delivery failures so UI flow never breaks.
  });
}
