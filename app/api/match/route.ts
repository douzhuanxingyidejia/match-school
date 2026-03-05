import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MatchReq = {
  dob: string; // "YYYY-MM-DD"
  intake_year: number; // 例如 2026
  city: string;
  max_budget: number; // 必填
  min_budget?: number | null; // 选填
  curriculum?: string | null; // 选填
  room?: string | null; // 选填：'有' | '无'
  visa?: string | null; // 选填：'有' | '无'
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<MatchReq>;

    // --- 基础校验（前端也要做一遍，但后端必须兜底） ---
    if (!body.dob) {
      return NextResponse.json({ success: false, error: "dob is required" }, { status: 400 });
    }
    if (!body.intake_year || !Number.isFinite(body.intake_year)) {
      return NextResponse.json({ success: false, error: "intake_year is required" }, { status: 400 });
    }
    if (!body.city || !body.city.trim()) {
      return NextResponse.json({ success: false, error: "city is required" }, { status: 400 });
    }
    if (body.max_budget == null || !Number.isFinite(body.max_budget)) {
      return NextResponse.json({ success: false, error: "max_budget is required" }, { status: 400 });
    }

    const minBudget =
      body.min_budget == null || body.min_budget === ("" as any) ? null : Number(body.min_budget);
    const maxBudget = Number(body.max_budget);

    if (minBudget != null && Number.isFinite(minBudget) && minBudget > maxBudget) {
      return NextResponse.json(
        { success: false, error: "min_budget cannot be greater than max_budget" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    // --- 调用 RPC ---
    // p_room 暂不传给 RPC（数据库函数尚未支持），改为在结果中过滤
    const rpcPayload = {
      p_dob: body.dob,
      p_intake_year: Number(body.intake_year),
      p_max_budget: maxBudget,
      p_city: body.city.trim(),
      p_curriculum: body.curriculum ?? null,
      p_min_budget: minBudget,
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/match_school`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(rpcPayload),
    });

    const text = await res.text();
    console.log("RPC RESPONSE TEXT:", text);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, status: res.status, body: text },
        { status: 500 }
      );
    }

    let data: any[] = text ? JSON.parse(text) : [];

    // 若前端传了 room 筛选条件，在结果集中过滤
    const room = body.room ?? null;
    if (room) {
      data = data.filter((s: any) => s.room === room);
    }

    // 若前端传了 visa 筛选条件，在结果集中过滤
    const visa = body.visa ?? null;
    if (visa) {
      data = data.filter((s: any) => s.visa === visa);
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}