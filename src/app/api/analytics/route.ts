import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
