import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BUCKET = 'school-images'

// 校验 id：8 字符 base64url（A-Z a-z 0-9 _ -）
const ID_REGEX = /^[A-Za-z0-9_-]{6,12}$/

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!ID_REGEX.test(id)) {
    return new Response('invalid id', { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl) {
    return new Response('supabase not configured', { status: 500 })
  }

  const upstreamUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/reports/${id}.html`

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, { cache: 'no-store' })
  } catch (e: any) {
    return new Response('upstream fetch failed', { status: 502 })
  }

  if (upstream.status === 404) {
    return new Response('report not found', { status: 404 })
  }
  if (!upstream.ok) {
    return new Response(`upstream ${upstream.status}`, { status: 502 })
  }

  const html = await upstream.arrayBuffer()

  return new Response(html, {
    headers: {
      // 关键：强制 text/html，让浏览器渲染而不是显示源码
      'Content-Type': 'text/html; charset=utf-8',
      // Vercel Edge 会按这个缓存，对外加速
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
