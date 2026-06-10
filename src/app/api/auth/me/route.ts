import { NextResponse } from 'next/server';
import { getSessionActor } from '@/lib/auth';
import { errorResponse } from '@/lib/http';

export async function GET() {
  try {
    const actor = await getSessionActor();

    if (!actor) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      actor,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (
      message === 'Supabase service role is not configured'
      || message.startsWith('Missing required environment variable:')
    ) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return errorResponse(error);
  }
}
