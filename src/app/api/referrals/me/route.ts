import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { getReferralDashboardForRegistrant } from '@/lib/portal';

export async function GET() {
  try {
    const actor = await requireSession(['registrant']);
    const registrationId = actor.registrationId ?? actor.subjectId;
    const data = await getReferralDashboardForRegistrant(registrationId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return errorResponse(error);
  }
}

