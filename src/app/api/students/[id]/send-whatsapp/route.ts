import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { getStudentForMessaging, markStudentWhatsappSent } from '@/lib/portal';
import {
  buildRegistrationWhatsappMessage,
  sendWhatsappTextMessage,
} from '@/lib/whatsapp';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin', 'employee']);
    const { id } = await context.params;
    const student = await getStudentForMessaging(id, actor);

    const message = buildRegistrationWhatsappMessage(student);
    const data = await sendWhatsappTextMessage(student.phone, message);
    const deliveryId = data.data?.messageId ?? data.data?.id ?? data.data?.key?.id ?? null;
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
