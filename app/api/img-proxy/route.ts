import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// 允许代理的图片域名白名单（学校官网 CDN + 体系介绍/学校详情用到的图床）。
// 新增学校时若引入了新域名，把域名加进来。
const ALLOWED_HOSTS = [
  // 通用图床 / 体系介绍
  'images.pexels.com',
  'images.unsplash.com',
  'static.wixstatic.com',
  'cdn.tatlerasia.com',
  'mint-edm.sgp1.digitaloceanspaces.com',
  'chisedumy.swipepages.media',
  'upload.wikimedia.org',
  'studymalaysia.com',

  // 各学校官网 CDN（按字母序）
  'aism.edu.my',
  'alice-smith.edu.my',
  'www.alice-smith.edu.my',
  'beaconhousesriinai.edu.my',
  'cats-fc.org',
  'catsglobalschools.com',
  'event.epsomcollege.edu.my',
  'fairview.edu.my',
  'gardenschool.edu.my',
  'www.gardenschool.edu.my',
  'his.edu.my',
  'igbis.edu.my',
  'matrixschools.edu.my',
  'miskl.edu.my',
  'old.raffles-american-school.edu.my',
  'peninsula.edu.my',
  'raffles-american-school.edu.my',
  'sji-international.edu.my',
  'cdn.sji-international.edu.my',
  'sism.edu.my',
  'srikdu.edu.my',
  'sunwayschools.edu.my',
  'www.sunwayschools.edu.my',
  'www.charterhouse-htms.edu.my',
  'www.concordcollege.edu.my',
  'www.eaton.edu.my',
  'www.elc.edu.my',
  'www.kingsgate.edu.my',
  'www.ktj.edu.my',
  'www.marlboroughcollegemalaysia.org',
  'www.mkis.edu.my',
  'www.nexus.edu.my',
  'www.nordangliaeducation.com',
  'www.penangsisgroup.edu.my',
  'www.powiis.edu.my',
  'www.tenby.edu.my',
  'www.tis.edu.my',
  'www.tropicanacorp.com.my',
  'www.ucsiinternationalschool.edu.my',
  'www.uplands.org',
]

const BUCKET = 'school-images'

function urlToKey(url: string): string {
  return createHash('sha256').update(url).digest('hex')
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}

// 直接拉外站后透传给客户端（不上传 Supabase）；作为 fallback 用
async function passthroughUpstream(url: URL) {
  const upstream = await fetch(url.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: `${url.protocol}//${url.hostname}/`,
    },
    cache: 'force-cache',
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `upstream ${upstream.status}` },
      { status: 502 }
    )
  }

  const buf = await upstream.arrayBuffer()
  const contentType = upstream.headers.get('content-type') || 'image/jpeg'

  return new Response(buf, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

  let upstream: URL
  try {
    upstream = new URL(url)
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(upstream.hostname)) {
    return NextResponse.json(
      { error: `host not allowed: ${upstream.hostname}` },
      { status: 403 }
    )
  }

  if (upstream.protocol !== 'https:' && upstream.protocol !== 'http:') {
    return NextResponse.json({ error: 'invalid protocol' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    // 没配 service key，直接走透传（开发兜底）
    try {
      return await passthroughUpstream(upstream)
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'fetch failed' },
        { status: 502 }
      )
    }
  }

  const key = urlToKey(url)

  // 1) 优先从 Supabase Storage 取（服务器侧下载，无 CORS 协商）
  try {
    const { data: blob, error } = await supabase.storage.from(BUCKET).download(key)
    if (!error && blob) {
      const buf = await blob.arrayBuffer()
      // blob.type 来自 Supabase 上传时记录的 contentType
      const ct = blob.type || 'image/jpeg'
      return new Response(buf, {
        headers: {
          'Content-Type': ct,
          'Cache-Control': 'public, max-age=86400, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
  } catch {
    // 下载异常，走上游路径
  }

  // 2) 未缓存：拉上游
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(upstream.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: `${upstream.protocol}//${upstream.hostname}/`,
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'upstream fetch failed' },
      { status: 502 }
    )
  }

  if (!upstreamRes.ok) {
    return NextResponse.json(
      { error: `upstream ${upstreamRes.status}` },
      { status: 502 }
    )
  }

  const buf = await upstreamRes.arrayBuffer()
  const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg'

  // 3) 上传到 Supabase Storage（upsert 让并发请求安全），失败也不影响本次返回
  try {
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, {
        contentType,
        upsert: true,
        cacheControl: '31536000', // 1 年
      })
    if (uploadErr) {
      console.warn('[img-proxy] Supabase upload failed:', uploadErr.message)
    }
  } catch (e: any) {
    console.warn('[img-proxy] Supabase upload threw:', e?.message)
  }

  // 4) 直接返字节（不重定向），保证 CORS 简单且 html2canvas 能 toBlob
  return new Response(buf, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
