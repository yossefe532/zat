import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const defaultTemplateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const defaultTemplateLanguage = process.env.WHATSAPP_TEMPLATE_LANG || 'ar';
  if (!token || !phoneNumberId) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as SendBody;
  const to = body.to ? normalizeWaTarget(body.to) : '';
  if (!to) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const templateName = body.template?.name || defaultTemplateName;
  const templateLanguage = body.template?.language || defaultTemplateLanguage;

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = body.template || templateName
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: body.template?.bodyParams?.length
            ? [
                {
                  type: 'body',
                  parameters: body.template.bodyParams.map((text) => ({
                    type: 'text',
                    text,
                  })),
                },
              ]
            : undefined,
        },
      }
    : {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body: body.message || '',
        },
      };

  if (!templateName && !body.message) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ success: false, error: data }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

