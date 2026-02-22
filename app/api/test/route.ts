import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 直接走 REST Data API：最稳定、最可控（和你刚才成功的方式一致）
    const res = await fetch(`${url}/rest/v1/tuition?select=*&limit=1`, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
      },
    });

    const text = await res.text(); // 先拿文本，避免 JSON parse 报错吞信息

    if (!res.ok) {
      return NextResponse.json(
        { success: false, status: res.status, body: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sample: JSON.parse(text) });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}