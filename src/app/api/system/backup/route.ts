import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { createBackupSnapshot } from '@/lib/portal';

function isAuthorizedCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-vercel-cron');

  if (cronHeader === '1') {
    return true;
  }

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return false;
}

async function executeBackup(request: Request) {
  if (isAuthorizedCronRequest(request)) {
    const backup = await createBackupSnapshot({
      role: 'system',
      subjectId: 'cron',
      fullName: 'Vercel Cron',
    });

    return NextResponse.json({ success: true, data: backup });
  }

  const actor = await requireSession(['admin']);
  const backup = await createBackupSnapshot(actor);
  return NextResponse.json({ success: true, data: backup });
}

export async function POST(request: Request) {
  try {
    return await executeBackup(request);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    return await executeBackup(request);
  } catch (error) {
    return errorResponse(error);
  }
}
