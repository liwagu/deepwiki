import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.SERVER_BASE_URL || 'http://localhost:8001';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  try {
    const slugStr = slug.join('/');
    const res = await fetch(`${BACKEND_URL}/sessions/by-slug/${encodeURIComponent(slugStr)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
