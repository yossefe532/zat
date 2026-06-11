import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { requestReferralMilestoneRedemption } from '@/lib/portal';
import { buildWhatsappLink } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const actor = await requireSession(['registrant']);
    const registrationId = actor.registrationId ?? actor.subjectId;
    const body = (await request.json().catch(() => ({}))) as { milestone?: number };
    const milestone = body.milestone;

    if (milestone !== 1 && milestone !== 3 && milestone !== 5) {
      return NextResponse.json({ success: false, message: 'مرحلة غير صالحة' }, { status: 400 });
    }

    const result = await requestReferralMilestoneRedemption(registrationId, milestone);
    const whatsappUrl = buildWhatsappLink(result.targetWhatsapp, result.message);
    return NextResponse.json({ success: true, data: { whatsappUrl } });
  } catch (error) {
    return errorResponse(error);
  }
}

