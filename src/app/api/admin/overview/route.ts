import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { getAdminOverview } from '@/lib/portal';

export async function GET() {
  try {
    await requireSession(['admin']);
    const overview = await getAdminOverview();
    return NextResponse.json({ success: true, data: overview });
  } catch (error) {
    return errorResponse(error);
  }
}
