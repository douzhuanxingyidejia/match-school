import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const BUCKET = 'school-images' // 复用现有 public bucket，文件放 reports/ 前缀

function shortId(): string {
  // 8 字符随机 base36：约 2.8 万亿组合，对外难猜
  return randomBytes(6).toString('base64url').slice(0, 8)
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}

export async function POST(req: Request) {
  let body: { html?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const html = body?.html
  if (typeof html !== 'string' || html.length === 0) {
    return NextResponse.json({ error: 'missing html' }, { status: 400 })
  }
  if (html.length > 5_000_000) {
    return NextResponse.json({ error: 'html too large (>5MB)' }, { status: 413 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json(
      { error: 'supabase not configured' },
      { status: 500 }
    )
  }

  // 生成短 ID 并尝试上传，碰撞重试 3 次
  let key = ''
  let lastError: any = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = shortId()
    key = `reports/${id}.html`
    const buf = Buffer.from(html, 'utf-8')
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, {
        contentType: 'text/html; charset=utf-8',
        upsert: false,
        cacheControl: '0', // 报告链接是静态快照，但允许我们调试时强制刷新
      })
    if (!error) {
      // 返回 Next.js 短链 /r/<id>，由该路由透传 Supabase HTML 并强制 text/html
      const origin = new URL(req.url).origin
      const url = `${origin}/r/${id}`
      return NextResponse.json({ url, id })
    }
    lastError = error
    // duplicate ID 才重试，其他错误立刻返回
    if (!String(error.message || '').toLowerCase().includes('exist')) break
  }

  console.error('[reports/upload] supabase error:', lastError)
  return NextResponse.json(
    { error: lastError?.message || 'upload failed' },
    { status: 500 }
  )
}
