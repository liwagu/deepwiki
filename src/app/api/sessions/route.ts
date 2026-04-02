import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.SERVER_BASE_URL || 'http://localhost:8001';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = new URLSearchParams();
    if (searchParams.get('owner')) params.set('owner', searchParams.get('owner')!);
    if (searchParams.get('repo')) params.set('repo', searchParams.get('repo')!);
    if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!);
    const res = await fetch(`${BACKEND_URL}/sessions?${params}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
