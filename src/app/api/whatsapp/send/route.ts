import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendWhatsappTextMessage } from '@/lib/whatsapp';

type SendBody = {
  to?: string;
  message?: string;
  template?: {
    name: string;
    language?: string;
    bodyParams?: string[];
  };
};

function normalizeDigits(input: string) {
  return input.replace(/[^\d]/g, '');
}

function normalizeWaTarget(phone: string) {
  const normalized = normalizeDigits(phone);
  if (normalized.startsWith('20')) return normalized;
  if (normalized.startsWith('0')) return `2${normalized}`;
  return normalized;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('zat_admin')?.value === '1';
  if (!isAdmin) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SendBody;
  const to = body.to ? normalizeWaTarget(body.to) : '';
  if (!to) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const message = body.message || body.template?.bodyParams?.join('\n') || '';
  if (!message) {
    return NextResponse.json(
      { success: false, error: 'رسالة واتساب النصية مطلوبة عند استخدام WasenderAPI' },
      { status: 400 },
    );
  }

  try {
    const data = await sendWhatsappTextMessage(to, message);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'فشل إرسال الواتساب' },
      { status: 400 },
    );
  }
}

