import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { getStudentForMessaging, markStudentWhatsappSent } from '@/lib/portal';
import {
  buildRegistrationWhatsappMessage,
  normalizeWhatsappTarget,
} from '@/lib/whatsapp';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin', 'employee']);
    const { id } = await context.params;
    const student = await getStudentForMessaging(id, actor);

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      throw new Error('مفاتيح واتساب غير مهيأة في البيئة');
    }

    const message = buildRegistrationWhatsappMessage(student);
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizeWhatsappTarget(student.phone),
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(data.error?.message ?? 'فشل إرسال رسالة الواتساب');
    }

    const deliveryId = data.messages?.[0]?.id ?? null;
    const updatedStudent = await markStudentWhatsappSent(id, actor, deliveryId);

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      messagePreview: message,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
