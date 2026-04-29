'use client'

import { useState, useRef } from 'react'
import { detailUrlFor } from './lib/school-details'
import {
  CURRICULUM_ORDER,
  curriculumLabelFor,
  curriculumIntroUrlFor,
} from './lib/curricula'

const DEFAULT_MYR_TO_CNY = 1.55

function formatTuition(num, myrToCny = null) {
  if (num == null || num === '') return { myr: '—', cny: null }
  const n = Number(num)
  if (!Number.isFinite(n)) return { myr: String(num), cny: null }
  const myrStr = `${n.toLocaleString('en-US')} 马币`
  const cnyStr =
    myrToCny != null && Number.isFinite(myrToCny) && myrToCny > 0
      ? `约 ${Math.round(n * myrToCny).toLocaleString('en-US')} 人民币`
      : null
  return { myr: myrStr, cny: cnyStr }
}

function buildDob(year, month, day) {
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const daysInMonth = new Date(y, m, 0).getDate()
  if (d > daysInMonth) return null
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function getAgeAtIntake(dob, intakeYear) {
  if (!dob || !intakeYear) return null
  const birth = new Date(dob)
  const year = birth.getFullYear()
  if (!Number.isFinite(year)) return null
  return intakeYear - year
}

const BIRTH_YEAR_START = 2000
const BIRTH_YEAR_END = new Date().getFullYear() + 2
const BIRTH_YEARS = Array.from(
  { length: BIRTH_YEAR_END - BIRTH_YEAR_START + 1 },
  (_, i) => BIRTH_YEAR_END - i
)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function getDaysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

function getGradeLabel(age) {
  if (age == null || age < 3) return '—'
  if (age === 3) return 'Nursery / 幼儿'
  if (age === 4) return 'Reception / 学前'
  if (age === 5) return 'Year 1 / 一年级'
  if (age === 6) return 'Year 2 / 二年级'
  if (age === 7) return 'Year 3 / 三年级'
  if (age === 8) return 'Year 4 / 四年级'
  if (age === 9) return 'Year 5 / 五年级'
  if (age === 10) return 'Year 6 / 六年级'
  if (age === 11) return 'Year 7 / 初一'
  if (age === 12) return 'Year 8 / 初二'
  if (age === 13) return 'Year 9 / 初三'
  if (age === 14) return 'Year 10 / 高一'
  if (age === 15) return 'Year 11 / 高二'
  if (age === 16) return 'Year 12 / 高三'
  if (age === 17) return 'Year 13'
  return `Year ${age - 4}`
}

const CITY_OPTIONS = ['新山', '吉隆坡', '槟城']

const CURRICULUM_OPTIONS = [
  { value: 'AUS', label: 'AUS' },
  { value: 'IB', label: 'IB' },
  { value: 'OSSD', label: 'OSSD' },
  { value: 'UK', label: 'UK' },
  { value: 'US', label: 'AP' }, // DB 值仍为 US，仅显示标签为 AP
]

const ROOM_OPTIONS = [
  { value: '有', label: '有住宿' },
  { value: '无', label: '无住宿' },
]

const VISA_OPTIONS = [
  { value: '有', label: '可办签证' },
  { value: '无', label: '不办签证' },
]

const CURRICULUM_COLORS = {
  AUS: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    header: 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100',
  },
  IB: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    header: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100',
  },
  OSSD: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    header: 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100',
  },
  UK: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100',
  },
  US: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
    header: 'bg-violet-100 dark:bg-violet-900/60 text-violet-900 dark:text-violet-100',
  },
  不限定: {
    bg: 'bg-zinc-50 dark:bg-zinc-800/80',
    border: 'border-zinc-200 dark:border-zinc-700',
    header: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100',
  },
}

function getCurriculumStyle(curriculumKey) {
  return CURRICULUM_COLORS[curriculumKey] || CURRICULUM_COLORS['不限定']
}

// ─── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['学生信息', '学校匹配', '选校报告']
  return (
    <div className="mb-6 flex items-center gap-1">
      {steps.map((label, i) => {
        const idx = i + 1
        const active = idx === current
        const done = idx < current
        return (
          <div key={idx} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                ${active ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : ''}
                ${done ? 'bg-zinc-300 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300' : ''}
                ${!active && !done ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500' : ''}
              `}
            >
              {done ? '✓' : idx}
            </div>
            <span
              className={`text-xs ${active ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-1 h-px w-6 bg-zinc-200 dark:bg-zinc-700" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function Home() {
  // ── Step management ──
  const [step, setStep] = useState(1)

  // ── Page 3: PDF export ref ──
  const reportRef = useRef(null)

  // ── Page 1: student info ──
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    gender: '',
    nationality: '',
    accompanyParent: '',
    dependentVisa: '',
    englishLevel: '',
    notes: '',
  })

  // ── Page 2: cart ──
  const [selectedSchools, setSelectedSchools] = useState(new Map()) // key → school
  const [cartOpen, setCartOpen] = useState(false)

  // ── Page 3: 长图导出状态 ──
  const [exportingState, setExportingState] = useState({ active: false, label: '' })

  // ── Page 3: 分享链接状态 ──
  const [sharingState, setSharingState] = useState({ active: false, label: '' })
  const [shareUrl, setShareUrl] = useState(null) // 生成成功后的链接

  // ── Page 2: matching form & results ──
  const [resultsByCurriculum, setResultsByCurriculum] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [myrToCny, setMyrToCny] = useState(DEFAULT_MYR_TO_CNY)

  const [form, setForm] = useState({
    cities: [],
    dob_year: '',
    dob_month: '',
    dob_day: '',
    intake_year: new Date().getFullYear(),
    max_budget: '',
    min_budget: '',
    curricula: [],
    rooms: [],
    visas: [],
  })

  // ── Cart helpers ──
  const getSchoolKey = (school) =>
    school.id ?? school.school_name_cn ?? school.school_name_en ?? JSON.stringify(school)

  const toggleSchool = (school) => {
    const key = getSchoolKey(school)
    setSelectedSchools((prev) => {
      const next = new Map(prev)
      if (next.has(key)) next.delete(key)
      else next.set(key, school)
      return next
    })
  }

  const isSchoolSelected = (school) => selectedSchools.has(getSchoolKey(school))

  // ── Form helpers ──
  const toggleCity = (city) =>
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }))

  const toggleCurriculum = (value) =>
    setForm((prev) => ({
      ...prev,
      curricula: prev.curricula.includes(value)
        ? prev.curricula.filter((c) => c !== value)
        : [...prev.curricula, value],
    }))

  const toggleRoom = (value) =>
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.includes(value)
        ? prev.rooms.filter((r) => r !== value)
        : [...prev.rooms, value],
    }))

  const toggleVisa = (value) =>
    setForm((prev) => ({
      ...prev,
      visas: prev.visas.includes(value)
        ? prev.visas.filter((v) => v !== value)
        : [...prev.visas, value],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitted(true)

    const dob = buildDob(form.dob_year, form.dob_month, form.dob_day)
    const intakeYear = Number(form.intake_year)
    const maxBudget = form.max_budget === '' ? null : Number(form.max_budget)
    const minBudget = form.min_budget === '' ? null : Number(form.min_budget)
    const cities = form.cities.filter(Boolean)
    const curricula = form.curricula.length ? form.curricula : CURRICULUM_OPTIONS.map((o) => o.value)
    const room = form.rooms.length === 1 ? form.rooms[0] : null
    const visa = form.visas.length === 1 ? form.visas[0] : null

    if (!cities.length) { setError('请至少选择一个城市'); return }
    if (!dob) { setError('请选择出生年、月、日'); return }
    if (!Number.isFinite(intakeYear) || intakeYear < 2000 || intakeYear > 2040) {
      setError('请填写有效的入学年份（如 2026）'); return
    }
    if (maxBudget == null || !Number.isFinite(maxBudget) || maxBudget < 0) {
      setError('请填写最大预算'); return
    }
    if (minBudget != null && Number.isFinite(minBudget) && minBudget > maxBudget) {
      setError('最小预算不能大于最大预算'); return
    }

    setLoading(true)
    try {
      const curriculumLabels = { null: '不限定' }
      CURRICULUM_OPTIONS.forEach((o) => (curriculumLabels[o.value] = o.label))

      const byCurriculum = {}
      const addSchool = (curriculum, school) => {
        if (!byCurriculum[curriculum]) byCurriculum[curriculum] = new Map()
        const key = school.id ?? school.school_name_cn ?? school.school_name_en ?? JSON.stringify(school)
        byCurriculum[curriculum].set(key, school)
      }

      for (const city of cities) {
        for (const curriculum of curricula) {
          const res = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city,
              dob,
              intake_year: intakeYear,
              max_budget: maxBudget,
              min_budget: minBudget || null,
              curriculum: curriculum || null,
              room: room || null,
              visa: visa || null,
            }),
          })
          const json = await res.json()
          if (!json.success) { setError(json.error || json.body || '请求失败'); return }
          const list = json.data || []
          const key = curriculum ?? '不限定'
          list.forEach((s) => addSchool(key, s))
        }
      }

      const order = curricula.map((c) => c ?? '不限定')
      const result = order.map((curriculumKey) => ({
        curriculum: curriculumKey,
        curriculumLabel: curriculumLabels[curriculumKey] ?? curriculumKey,
        schools: Array.from(byCurriculum[curriculumKey]?.values() ?? []),
      }))
      setResultsByCurriculum(result)
    } catch (e) {
      setError(e?.message || '网络或请求异常')
    } finally {
      setLoading(false)
    }
  }

  const dobForAge = buildDob(form.dob_year, form.dob_month, form.dob_day)
  const age = getAgeAtIntake(dobForAge, Number(form.intake_year))
  const gradeLabel = getGradeLabel(age)

  // ══════════════════════════════════════════════════════
  // PAGE 1 — 学生基本信息
  // ══════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
          <StepIndicator current={1} />
          <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            学生基本信息
          </h1>
          <form
            onSubmit={(e) => { e.preventDefault(); setStep(2) }}
            className="space-y-5 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-5"
          >
            {/* 姓名 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                学生姓名 <span className="text-zinc-400">（选填）</span>
              </label>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo((p) => ({ ...p, name: e.target.value }))}
                placeholder="请输入学生姓名"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            {/* 性别 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                学生性别 <span className="text-zinc-400">（选填）</span>
              </label>
              <div className="flex gap-3">
                {['男', '女'].map((g) => (
                  <label
                    key={g}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={studentInfo.gender === g}
                      onChange={() => setStudentInfo((p) => ({ ...p, gender: g }))}
                      className="border-zinc-400"
                    />
                    <span className="text-zinc-900 dark:text-zinc-100">{g}</span>
                  </label>
                ))}
                {studentInfo.gender && (
                  <button
                    type="button"
                    onClick={() => setStudentInfo((p) => ({ ...p, gender: '' }))}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>

            {/* 国籍 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                国籍 <span className="text-zinc-400">（选填）</span>
              </label>
              <input
                type="text"
                value={studentInfo.nationality}
                onChange={(e) => setStudentInfo((p) => ({ ...p, nationality: e.target.value }))}
                placeholder="如：中国"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            {/* 陪读家长 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                陪读家长 <span className="text-zinc-400">（选填）</span>
              </label>
              <input
                type="text"
                value={studentInfo.accompanyParent}
                onChange={(e) => setStudentInfo((p) => ({ ...p, accompanyParent: e.target.value }))}
                placeholder="如：爸爸 / 妈妈"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            {/* 需要陪读签证 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                需要陪读签证 <span className="text-zinc-400">（选填）</span>
              </label>
              <input
                type="text"
                value={studentInfo.dependentVisa}
                onChange={(e) => setStudentInfo((p) => ({ ...p, dependentVisa: e.target.value }))}
                placeholder="如：是 / 否"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            {/* 英语水平 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                英语水平 <span className="text-zinc-400">（选填）</span>
              </label>
              <input
                type="text"
                value={studentInfo.englishLevel}
                onChange={(e) => setStudentInfo((p) => ({ ...p, englishLevel: e.target.value }))}
                placeholder="如：初级 / 中级 / 流利"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            {/* 备注 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                备注 <span className="text-zinc-400">（选填）</span>
              </label>
              <textarea
                value={studentInfo.notes}
                onChange={(e) => setStudentInfo((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="其他补充信息"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              下一步 →
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // PAGE 3 — 选校报告（仅电脑端）
  // ══════════════════════════════════════════════════════
  if (step === 3) {
    const schoolList = Array.from(selectedSchools.values())
    const dobDisplay =
      form.dob_year && form.dob_month && form.dob_day
        ? `${form.dob_year}年${Number(form.dob_month)}月${Number(form.dob_day)}日`
        : '—'

    const handleExportLongImage = async () => {
      if (schoolList.length === 0) {
        alert('请先选择至少一所学校')
        return
      }

      // 按 CURRICULUM_ORDER 分组,跳过空组
      const groups = CURRICULUM_ORDER.map((cur) => ({
        cur,
        label: curriculumLabelFor(cur),
        schools: schoolList.filter((s) => s.curriculum === cur),
      })).filter((g) => g.schools.length > 0)

      if (groups.length === 0) {
        alert('选中的学校没有匹配到任何体系')
        return
      }

      setExportingState({ active: true, label: '准备…' })
      try {
        const { default: html2canvas } = await import('html2canvas')
        const opts = { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false }

        // 把外链 <img> 通过代理拉成字节，再转成 data: URI 塞回 src
        const blobToDataUri = (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(blob)
          })

        const rewriteImagesToProxy = async (doc) => {
          const imgs = Array.from(doc.querySelectorAll('img'))
          await Promise.all(
            imgs.map(async (img) => {
              const src = img.getAttribute('src')
              if (!src) return
              if (src.startsWith('data:')) return
              let u
              try {
                u = new URL(src, doc.location?.href || window.location.origin)
              } catch {
                return
              }
              if (u.origin === window.location.origin) return
              const proxiedUrl = `/api/img-proxy?url=${encodeURIComponent(u.toString())}`
              try {
                const res = await fetch(proxiedUrl)
                if (!res.ok) return
                const blob = await res.blob()
                const dataUri = await blobToDataUri(blob)
                await new Promise((resolve) => {
                  const done = () => {
                    img.removeEventListener('load', done)
                    img.removeEventListener('error', done)
                    resolve()
                  }
                  img.addEventListener('load', done)
                  img.addEventListener('error', done)
                  img.removeAttribute('crossorigin')
                  img.src = dataUri
                })
              } catch (e) {
                console.warn('转 dataURI 失败:', u.toString(), e)
              }
            })
          )
        }

        // 构造一份"屏幕外的"页头 DOM：学生信息 + 5 列表（仅本体系）
        const buildHiddenHeaderEl = (label, groupSchools) => {
          const studentRowsHtml = [
            ['学生姓名', studentInfo.name],
            ['学生性别', studentInfo.gender],
            ['入学年份', `${form.intake_year} 年`],
            ['出生日期', dobDisplay],
            ['国籍', studentInfo.nationality],
            ['陪读家长', studentInfo.accompanyParent],
            ['需要陪读签证', studentInfo.dependentVisa],
            ['英语水平', studentInfo.englishLevel],
            ['备注', studentInfo.notes],
          ]
            .map(
              ([k, v]) =>
                `<div><span style="color:#667991">${k}：</span><span style="color:#082b5f;font-weight:600">${esc(v || '—')}</span></div>`
            )
            .join('')

          const tableRowsHtml = groupSchools
            .map((s, i) => {
              const t = formatTuition(s.tuition_amount)
              const isLast = i === groupSchools.length - 1
              const border = isLast ? 'none' : '1px solid rgba(37,104,184,.06)'
              return `
                <tr style="border-bottom:${border}">
                  <td style="padding:14px 18px;font-weight:600;color:#082b5f">${esc(s.school_name_cn || '—')}</td>
                  <td style="padding:14px 18px;color:#243f63">${esc(s.city || '—')}</td>
                  <td style="padding:14px 18px;color:#243f63">${esc(s.grade_display || '—')}</td>
                  <td style="padding:14px 18px;color:#243f63;white-space:nowrap;font-weight:600">${esc(t.myr)}</td>
                  <td style="padding:14px 18px;color:#243f63">${esc(s.intake_months || '—')}</td>
                </tr>`
            })
            .join('')

          const wrapper = document.createElement('div')
          wrapper.style.cssText =
            'position:fixed;left:-9999px;top:0;width:1100px;padding:32px 28px 24px;background:linear-gradient(180deg,#f7fbff 0%,#edf5ff 100%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif;color:#243f63;'
          wrapper.innerHTML = `
            <h1 style="font-size:30px;font-weight:900;color:#082b5f;margin:0 0 24px;letter-spacing:-0.025em">选校报告 · 《${esc(label)}》体系</h1>

            <div style="background:#fff;border:1px solid rgba(37,104,184,.12);border-radius:24px;box-shadow:0 20px 50px rgba(15,55,100,.08);margin-bottom:20px;overflow:hidden">
              <div style="padding:14px 22px;border-bottom:1px solid rgba(37,104,184,.08)">
                <h2 style="margin:0;font-size:17px;font-weight:800;color:#082b5f">学生信息</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px 32px;padding:20px 22px;font-size:16px">
                ${studentRowsHtml}
              </div>
            </div>

            <div style="background:#fff;border:1px solid rgba(37,104,184,.12);border-radius:24px;box-shadow:0 20px 50px rgba(15,55,100,.08);overflow:hidden">
              <table style="width:100%;border-collapse:collapse;font-size:15px">
                <thead>
                  <tr style="background:#eef5ff;border-bottom:1px solid rgba(37,104,184,.12)">
                    ${['学校名字', '城市', '就读年级', '每年学费', '入学月份']
                      .map(
                        (h) =>
                          `<th style="padding:14px 18px;text-align:left;font-size:14px;font-weight:800;color:#082b5f;white-space:nowrap">${h}</th>`
                      )
                      .join('')}
                  </tr>
                </thead>
                <tbody>${tableRowsHtml}</tbody>
              </table>
            </div>
          `
          return wrapper
        }

        let imageIdx = 0
        for (const g of groups) {
          imageIdx++
          const tag = `${g.label} (${imageIdx}/${groups.length})`

          // 1) 抓取本体系下的 iframe
          const introIframe = document.querySelector(
            `section[data-curriculum-group="${g.cur}"] iframe.curriculum-intro-frame`
          )
          const schoolIframes = Array.from(
            document.querySelectorAll(
              `section[data-curriculum-group="${g.cur}"] iframe.school-detail-frame`
            )
          )

          // 2) 并行预热图片代理
          setExportingState({ active: true, label: `${tag} - 加载图片…` })
          const allFrames = [introIframe, ...schoolIframes].filter(Boolean)
          await Promise.all(
            allFrames.map(async (f) => {
              try {
                const doc = f.contentDocument
                if (doc?.body) await rewriteImagesToProxy(doc)
              } catch (e) {
                console.warn('图片代理预热失败:', e)
              }
            })
          )

          // 3) 截图：header → 体系介绍 → 各学校
          setExportingState({ active: true, label: `${tag} - 截取页头…` })
          const headerEl = buildHiddenHeaderEl(g.label, g.schools)
          document.body.appendChild(headerEl)
          const canvases = []
          try {
            canvases.push(await html2canvas(headerEl, opts))
          } catch (e) {
            console.warn('截 header 失败:', e)
          }
          headerEl.remove()

          if (introIframe?.contentDocument?.body) {
            setExportingState({ active: true, label: `${tag} - 截取体系介绍…` })
            try {
              canvases.push(await html2canvas(introIframe.contentDocument.body, opts))
            } catch (e) {
              console.warn('截介绍失败:', e)
            }
          }

          for (let si = 0; si < schoolIframes.length; si++) {
            setExportingState({
              active: true,
              label: `${tag} - 截取学校 ${si + 1}/${schoolIframes.length}…`,
            })
            const doc = schoolIframes[si].contentDocument
            if (!doc?.body) continue
            try {
              canvases.push(await html2canvas(doc.body, opts))
            } catch (e) {
              console.warn('截学校失败:', e)
            }
          }

          if (canvases.length === 0) {
            console.warn(`${g.label} 没有任何画布,跳过`)
            continue
          }

          // 4) 拼接 + 下载
          setExportingState({ active: true, label: `${tag} - 拼接下载…` })
          const targetWidth = Math.max(...canvases.map((c) => c.width))
          const scaledHeights = canvases.map((c) => Math.round((c.height * targetWidth) / c.width))
          const totalHeight = scaledHeights.reduce((s, h) => s + h, 0)

          const finalCanvas = document.createElement('canvas')
          finalCanvas.width = targetWidth
          finalCanvas.height = totalHeight
          const ctx = finalCanvas.getContext('2d')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, targetWidth, totalHeight)
          let y = 0
          canvases.forEach((c, i) => {
            ctx.drawImage(c, 0, y, targetWidth, scaledHeights[i])
            y += scaledHeights[i]
          })

          await new Promise((resolve) => {
            finalCanvas.toBlob((blob) => {
              if (!blob) {
                console.warn(`${g.label} toBlob 失败`)
                resolve()
                return
              }
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.download = `选校报告_${g.label}.png`
              link.href = url
              link.click()
              setTimeout(() => URL.revokeObjectURL(url), 1000)
              resolve()
            }, 'image/png')
          })

          // 浏览器对快速连续下载有时会拦,中间稍微停一下
          await new Promise((r) => setTimeout(r, 400))
        }
      } catch (err) {
        console.error('导出长图失败:', err)
        alert('导出失败：' + (err?.message || err))
      } finally {
        setExportingState({ active: false, label: '' })
      }
    }

    // 简单 HTML 转义，防 XSS
    const esc = (s) =>
      String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      }[c]))

    // 构造一份自包含的报告 HTML：渐变蓝主题 + 顶部学生信息 + 5列汇总表 + 按体系分组的介绍/详情 iframe
    const buildShareableHtml = () => {
      const baseUrl = window.location.origin
      const studentInfoHtml = [
        ['学生姓名', studentInfo.name],
        ['学生性别', studentInfo.gender],
        ['入学年份', `${form.intake_year} 年`],
        ['出生日期', dobDisplay],
        ['国籍', studentInfo.nationality],
        ['陪读家长', studentInfo.accompanyParent],
        ['需要陪读签证', studentInfo.dependentVisa],
        ['英语水平', studentInfo.englishLevel],
        ['备注', studentInfo.notes],
      ]
        .map(
          ([k, v]) => `
            <div>
              <span class="il">${esc(k)}：</span>
              <span class="iv">${esc(v || '—')}</span>
            </div>`
        )
        .join('')

      const tableRowsHtml = schoolList
        .map((school, i) => {
          const t = formatTuition(school.tuition_amount)
          const isLast = i === schoolList.length - 1
          return `
            <tr${isLast ? ' class="last"' : ''}>
              <td class="bold">${esc(school.school_name_cn || '—')}</td>
              <td>${esc(school.city || '—')}</td>
              <td>${esc(school.grade_display || '—')}</td>
              <td class="nowrap bold">${esc(t.myr)}</td>
              <td>${esc(school.intake_months || '—')}</td>
            </tr>`
        })
        .join('')

      // 按体系分组渲染
      const groupsHtml = CURRICULUM_ORDER.map((cur) => {
        const group = schoolList.filter((s) => s.curriculum === cur)
        if (group.length === 0) return ''
        const introUrl = curriculumIntroUrlFor(cur)
        const label = curriculumLabelFor(cur)
        const introIframe = introUrl
          ? `<div class="frame-card"><iframe src="${esc(baseUrl + introUrl)}" loading="lazy" title="${esc(label)} 体系介绍"></iframe></div>`
          : ''
        const schoolFrames = group
          .map((s) => {
            const d = detailUrlFor(s.school_name_en)
            if (!d) return ''
            return `<div class="frame-card"><iframe src="${esc(baseUrl + d)}" loading="lazy" title="${esc(s.school_name_cn || s.school_name_en)}"></iframe></div>`
          })
          .join('')
        return `
          <section class="cg">
            <div class="title-row">
              <span class="title-bar"></span>
              <h2>《${esc(label)}》体系介绍 · 已选 ${group.length} 所</h2>
            </div>
            ${introIframe}
            ${schoolFrames}
          </section>`
      }).join('')

      const studentName = esc(studentInfo.name || '选校报告')

      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${studentName} · 选校报告</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: linear-gradient(180deg, #f7fbff 0%, #edf5ff 100%);
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
    color: #243f63;
  }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 36px 24px 64px; }
  h1 { font-size: 30px; margin: 0 0 28px; font-weight: 900; color: #082b5f; letter-spacing: -0.025em; }
  .card { background: #fff; border: 1px solid rgba(37,104,184,.12); border-radius: 24px; box-shadow: 0 20px 50px rgba(15,55,100,.08); margin-bottom: 24px; overflow: hidden; }
  .card-header { padding: 14px 22px; border-bottom: 1px solid rgba(37,104,184,.08); font-size: 17px; font-weight: 800; color: #082b5f; }
  .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 32px; padding: 20px 22px; font-size: 16px; }
  @media (max-width: 720px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
  .il { color: #667991; }
  .iv { color: #082b5f; font-weight: 600; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  thead tr { background: #eef5ff; border-bottom: 1px solid rgba(37,104,184,.12); }
  th { padding: 14px 18px; text-align: left; font-weight: 800; color: #082b5f; white-space: nowrap; font-size: 14px; }
  td { padding: 14px 18px; color: #243f63; border-bottom: 1px solid rgba(37,104,184,.06); }
  tr.last td { border-bottom: none; }
  td.bold { font-weight: 600; color: #082b5f; }
  td.nowrap { white-space: nowrap; }
  .footnote { font-size: 12px; color: #94a3b8; margin: 12px 0 0; }
  .cg { margin-top: 40px; }
  .title-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .title-bar { width: 8px; height: 36px; border-radius: 999px; background: linear-gradient(180deg, #1f63b7 0%, #5aa7ff 100%); flex: 0 0 auto; }
  .title-row h2 { margin: 0; color: #082b5f; font-size: 24px; font-weight: 900; letter-spacing: -0.025em; }
  .frame-card { margin-top: 24px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,55,100,.08); }
  .frame-card:first-of-type { margin-top: 0; }
  .frame-card iframe { width: 100%; border: 0; display: block; min-height: 1400px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>选校报告</h1>

    <div class="card">
      <div class="card-header">学生信息</div>
      <div class="info-grid">${studentInfoHtml}</div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>学校名字</th><th>城市</th><th>就读年级</th><th>每年学费</th><th>入学月份</th>
            </tr>
          </thead>
          <tbody>${tableRowsHtml || '<tr><td colspan="5" style="text-align:center;color:#a1a1aa;padding:32px;">暂无选中的学校</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    <p class="footnote">* 本表所列费用基于学校目前官方文件整理，实际费用可能随年度、政策及汇率变化而调整，最终收费标准以学校正式账单或录取通知书为准。</p>

    ${groupsHtml}
  </div>
  <script>
    // iframe 高度按内容自适应
    document.querySelectorAll('iframe').forEach((f) => {
      f.addEventListener('load', () => {
        try {
          const h = f.contentDocument && f.contentDocument.body && f.contentDocument.body.scrollHeight;
          if (h) f.style.height = h + 'px';
        } catch (e) {}
      });
    });
  </script>
</body>
</html>`
    }

    const handleShareReport = async () => {
      if (schoolList.length === 0) {
        alert('请先选择至少一所学校')
        return
      }
      setSharingState({ active: true, label: '生成中…' })
      try {
        const html = buildShareableHtml()
        setSharingState({ active: true, label: '上传中…' })
        const res = await fetch('/api/reports/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html }),
        })
        const json = await res.json()
        if (!res.ok || !json.url) {
          throw new Error(json.error || '上传失败')
        }
        setShareUrl(json.url)
      } catch (err) {
        console.error('生成分享链接失败:', err)
        alert('生成失败：' + (err?.message || err))
      } finally {
        setSharingState({ active: false, label: '' })
      }
    }

    // 共享 iframe onLoad 处理：注入打印样式 + 自适应高度（学校详情和体系介绍 iframe 共用）
    const handleDetailFrameLoad = (e) => {
      try {
        const doc = e.target.contentDocument
        if (!doc) return
        const PRINT_CSS = `
          @media print {
            @page { size: A4; margin: 10mm; }
            html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
            .page { width: 100% !important; max-width: 100% !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; background: #fff !important; box-shadow: none !important; }
            .hero-card { height: 200px !important; box-shadow: none !important; }
            .school-name-cn { font-size: 28px !important; }
            .school-name-en { font-size: 16px !important; margin-top: 8px !important; }
            .curriculum-tags { margin-top: 12px !important; }
            .curriculum-tags span { font-size: 13px !important; padding: 6px 14px !important; }
            .location-pill { margin-top: 12px !important; padding: 8px 16px !important; font-size: 14px !important; }
            .hero-content { left: 24px !important; top: 24px !important; right: 24px !important; bottom: 20px !important; }
            section { margin-top: 20px !important; }
            .section-title-row h2 { font-size: 22px !important; }
            .intro-text { font-size: 14px !important; line-height: 1.6 !important; }
            .stat-value { font-size: 20px !important; }
            .stat-label { font-size: 12px !important; }
            .advantage-card h3 { font-size: 16px !important; }
            .advantage-card p { font-size: 13px !important; }
            .curriculum-card h3 { font-size: 20px !important; }
            .curriculum-card p { font-size: 13px !important; }
            .curriculum-age { font-size: 14px !important; margin-bottom: 10px !important; }
            .activity-title { font-size: 13px !important; }
            .campus-card { height: 120px !important; }
            .hero-card, .intro-card, .advantage-card, .campus-card, .curriculum-card, .activity-card {
              break-inside: avoid !important; page-break-inside: avoid !important; box-shadow: none !important;
            }
            * { box-shadow: none !important; }
          }
        `
        if (!doc.querySelector('style[data-print-injected]')) {
          const style = doc.createElement('style')
          style.setAttribute('data-print-injected', 'true')
          style.textContent = PRINT_CSS
          doc.head.appendChild(style)
        }
        const h = doc.body?.scrollHeight
        if (h) e.target.style.height = h + 'px'
      } catch (_) {}
    }

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        alert('已复制到剪贴板')
      } catch {
        // 老浏览器兜底
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        alert('已复制到剪贴板')
      }
    }

    // 颜色常量（与 Tailwind zinc 调色板对应）
    const C = {
      bg: '#f9fafb',
      white: '#ffffff',
      border: '#e4e4e7',
      borderLight: '#f4f4f5',
      text: '#18181b',
      textMuted: '#71717a',
      textSub: '#3f3f46',
      headerBg: '#f9fafb',
      note: '#a1a1aa',
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* ── 分享链接弹窗 ── */}
        {shareUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 print:hidden"
            onClick={() => setShareUrl(null)}
          >
            <div
              className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                ✅ 分享链接已生成
              </h3>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                把下面的链接发给对方，他们打开就能看到完整的选校报告。
              </p>
              <div className="mb-4 flex items-center gap-2 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-200"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  复制
                </button>
              </div>
              <div className="flex justify-between gap-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  在新标签打开预览
                </a>
                <button
                  onClick={() => setShareUrl(null)}
                  className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 手机端提示 ── */}
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center md:hidden">
          <div className="mb-4 text-4xl">💻</div>
          <p className="mb-2 text-lg font-medium text-zinc-800 dark:text-zinc-100">请在电脑上查看完整报告</p>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">第 3 页报告仅支持电脑端显示</p>
          <button
            onClick={() => setStep(2)}
            className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            ← 返回选校
          </button>
        </div>

        {/* ── 电脑端报告 ── */}
        <div className="hidden md:block">
          <div className="mx-auto max-w-5xl px-6 py-6">
            {/* 顶部操作栏（打印时隐藏） */}
            <div className="mb-5 flex items-center justify-between print:hidden">
              <button
                onClick={() => setStep(2)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                ← 返回选校
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  🖨 打印
                </button>
                <button
                  onClick={handleExportLongImage}
                  disabled={exportingState.active || sharingState.active}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 min-w-[180px]"
                >
                  {exportingState.active ? `⏳ ${exportingState.label}` : '📷 导出长图'}
                </button>
                <button
                  onClick={handleShareReport}
                  disabled={exportingState.active || sharingState.active}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 min-w-[180px]"
                >
                  {sharingState.active ? `⏳ ${sharingState.label}` : '🔗 生成分享链接'}
                </button>
              </div>
            </div>

            {/* 报告内容区 - 渐变蓝主题 */}
            <div
              style={{
                background: 'linear-gradient(180deg, #f7fbff 0%, #edf5ff 100%)',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                color: '#243f63',
                padding: '32px 24px 64px',
                borderRadius: 24,
              }}
            >
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#082b5f',
                  margin: '0 0 28px',
                  letterSpacing: '-0.025em',
                }}
              >
                选校报告
              </h1>

              {/* 学生信息卡 */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(37,104,184,.12)',
                  borderRadius: 24,
                  boxShadow: '0 20px 50px rgba(15,55,100,.08)',
                  marginBottom: 24,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(37,104,184,.08)' }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#082b5f' }}>学生信息</h2>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '14px 32px',
                    padding: '20px 22px',
                    fontSize: 16,
                  }}
                >
                  {[
                    ['学生姓名', studentInfo.name],
                    ['学生性别', studentInfo.gender],
                    ['入学年份', `${form.intake_year} 年`],
                    ['出生日期', dobDisplay],
                    ['国籍', studentInfo.nationality],
                    ['陪读家长', studentInfo.accompanyParent],
                    ['需要陪读签证', studentInfo.dependentVisa],
                    ['英语水平', studentInfo.englishLevel],
                    ['备注', studentInfo.notes],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span style={{ color: '#667991' }}>{label}：</span>
                      <span style={{ color: '#082b5f', fontWeight: 600 }}>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学校汇总表 - 5 列 */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(37,104,184,.12)',
                  borderRadius: 24,
                  boxShadow: '0 20px 50px rgba(15,55,100,.08)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                    <thead>
                      <tr style={{ background: '#eef5ff', borderBottom: '1px solid rgba(37,104,184,.12)' }}>
                        {['学校名字', '城市', '就读年级', '每年学费', '入学月份'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '14px 18px',
                              textAlign: 'left',
                              fontSize: 14,
                              fontWeight: 800,
                              color: '#082b5f',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schoolList.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>
                            暂无选中的学校
                          </td>
                        </tr>
                      ) : (
                        schoolList.map((school, i) => {
                          const t = formatTuition(school.tuition_amount)
                          const isLast = i === schoolList.length - 1
                          return (
                            <tr
                              key={i}
                              style={{ borderBottom: isLast ? 'none' : '1px solid rgba(37,104,184,.06)' }}
                            >
                              <td style={{ padding: '14px 18px', fontWeight: 600, color: '#082b5f' }}>
                                {school.school_name_cn || '—'}
                              </td>
                              <td style={{ padding: '14px 18px', color: '#243f63' }}>{school.city || '—'}</td>
                              <td style={{ padding: '14px 18px', color: '#243f63' }}>
                                {school.grade_display || '—'}
                              </td>
                              <td
                                style={{
                                  padding: '14px 18px',
                                  color: '#243f63',
                                  whiteSpace: 'nowrap',
                                  fontWeight: 600,
                                }}
                              >
                                {t.myr}
                              </td>
                              <td style={{ padding: '14px 18px', color: '#243f63' }}>
                                {school.intake_months || '—'}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                * 本表所列费用基于学校目前官方文件整理，实际费用可能随年度、政策及汇率变化而调整，最终收费标准以学校正式账单或录取通知书为准。
              </p>

              {/* 按体系分组的详情区 */}
              {CURRICULUM_ORDER.map((cur) => {
                const group = schoolList.filter((s) => s.curriculum === cur)
                if (group.length === 0) return null
                const introUrl = curriculumIntroUrlFor(cur)
                const label = curriculumLabelFor(cur)
                return (
                  <section key={cur} data-curriculum-group={cur} style={{ marginTop: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <span
                        style={{
                          width: 8,
                          height: 36,
                          borderRadius: 999,
                          background: 'linear-gradient(180deg, #1f63b7 0%, #5aa7ff 100%)',
                          flex: '0 0 auto',
                        }}
                      />
                      <h2
                        style={{
                          margin: 0,
                          color: '#082b5f',
                          fontSize: 24,
                          fontWeight: 900,
                          letterSpacing: '-0.025em',
                        }}
                      >
                        《{label}》体系介绍 · 已选 {group.length} 所
                      </h2>
                    </div>
                    {introUrl && (
                      <div
                        style={{
                          marginBottom: 24,
                          borderRadius: 24,
                          overflow: 'hidden',
                          boxShadow: '0 20px 50px rgba(15,55,100,.08)',
                        }}
                      >
                        <iframe
                          src={introUrl}
                          className="curriculum-intro-frame"
                          title={`${label} 体系介绍`}
                          style={{ width: '100%', border: 0, display: 'block' }}
                          onLoad={handleDetailFrameLoad}
                        />
                      </div>
                    )}
                    {group.map((school, idx) => {
                      const url = detailUrlFor(school.school_name_en)
                      if (!url) return null
                      return (
                        <div
                          key={`detail-${cur}-${idx}`}
                          style={{
                            marginTop: 24,
                            borderRadius: 24,
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(15,55,100,.08)',
                          }}
                        >
                          <iframe
                            src={url}
                            className="school-detail-frame"
                            title={school.school_name_cn || school.school_name_en}
                            style={{ width: '100%', border: 0, display: 'block' }}
                            onLoad={handleDetailFrameLoad}
                          />
                        </div>
                      )
                    })}
                  </section>
                )
              })}
            </div>

            {/* ── 隐藏的 PDF 专用 div（纯 inline style，无 Tailwind，无 oklch 问题） ── */}
            <div
              ref={reportRef}
              style={{
                position: 'fixed', left: '-9999px', top: 0,
                width: '1100px', padding: '40px',
                backgroundColor: C.bg,
                fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif',
                color: C.text, fontSize: '14px', lineHeight: 1.6,
              }}
            >
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: C.text }}>选校报告</h1>

              {/* 学生信息卡 */}
              <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '8px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ borderBottom: `1px solid ${C.borderLight}`, padding: '10px 16px', backgroundColor: C.white }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: C.textSub }}>学生信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 24px', padding: '16px', fontSize: '13px' }}>
                  {[
                    ['学生姓名', studentInfo.name || '—'],
                    ['学生性别', studentInfo.gender || '—'],
                    ['入学年份', `${form.intake_year} 年`],
                    ['出生日期', dobDisplay],
                    ['国籍', studentInfo.nationality || '—'],
                    ['陪读家长', studentInfo.accompanyParent || '—'],
                    ['需要陪读签证', studentInfo.dependentVisa || '—'],
                    ['英语水平', studentInfo.englishLevel || '—'],
                    ['备注', studentInfo.notes || '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span style={{ color: C.textMuted }}>{label}：</span>
                      <span style={{ color: C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学校表格 */}
              <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
                      {['编号', '学校名字', '城市', '课程体系', '就读年级', '是否有住宿', '是否提供签证', '每年学费', '入学月份'].map((h) => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.textSub, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schoolList.map((school, index) => {
                      const t = formatTuition(school.tuition_amount)
                      const isLast = index === schoolList.length - 1
                      return (
                        <tr key={index} style={{ borderBottom: isLast ? 'none' : `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: '10px 12px', color: C.textMuted }}>{index + 1}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 500, color: C.text }}>{school.school_name_cn || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.city || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.curriculum || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.grade_display || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.room || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.visa || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub, whiteSpace: 'nowrap' }}>{t.myr}</td>
                          <td style={{ padding: '10px 12px', color: C.textSub }}>{school.intake_months || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p style={{ marginTop: '12px', fontSize: '11px', color: C.note }}>
                * 本表所列费用基于学校目前官方文件整理，实际费用可能随年度、政策及汇率变化而调整，最终收费标准以学校正式账单或录取通知书为准。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // PAGE 2 — 学校匹配
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* ── 购物车浮窗 ── */}
      {selectedSchools.size > 0 && (
        <div className="fixed right-4 top-4 z-50">
          <button
            onClick={() => setCartOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>🛒</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-900 dark:bg-zinc-900 dark:text-white">
              {selectedSchools.size}
            </span>
          </button>

          {cartOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
              <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-700">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  已选 {selectedSchools.size} 所学校
                </span>
              </div>
              <ul className="max-h-52 overflow-y-auto">
                {Array.from(selectedSchools.values()).map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="flex-1 truncate pr-2">
                      {s.school_name_cn || s.school_name_en || '—'}
                    </span>
                    <button
                      onClick={() => toggleSchool(s)}
                      className="text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-zinc-100 p-3 dark:border-zinc-700">
                <button
                  onClick={() => { setCartOpen(false); setStep(3) }}
                  className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  下一步 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* 步骤指示 + 返回 */}
        <div className="mb-2 flex items-center justify-between">
          <StepIndicator current={2} />
          <button
            onClick={() => setStep(1)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ← 修改学生信息
          </button>
        </div>

        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
          学校匹配
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-5"
        >
          {/* 城市 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              城市 <span className="text-red-500">*</span>（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {CITY_OPTIONS.map((city) => (
                <label
                  key={city}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={form.cities.includes(city)}
                    onChange={() => toggleCity(city)}
                    className="rounded border-zinc-400"
                  />
                  <span className="text-zinc-900 dark:text-zinc-100">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              出生日期 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.dob_year}
                onChange={(e) => {
                  const y = e.target.value
                  const maxDay = getDaysInMonth(y, form.dob_month)
                  setForm((p) => ({
                    ...p,
                    dob_year: y,
                    dob_day: p.dob_day && Number(p.dob_day) > maxDay ? '' : p.dob_day,
                  }))
                }}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              >
                <option value="">年</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y} 年</option>
                ))}
              </select>
              <select
                value={form.dob_month}
                onChange={(e) => {
                  const m = e.target.value
                  const maxDay = getDaysInMonth(form.dob_year, m)
                  setForm((p) => ({
                    ...p,
                    dob_month: m,
                    dob_day: p.dob_day && Number(p.dob_day) > maxDay ? '' : p.dob_day,
                  }))
                }}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              >
                <option value="">月</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m} 月</option>
                ))}
              </select>
              <select
                value={form.dob_day}
                onChange={(e) => setForm((p) => ({ ...p, dob_day: e.target.value }))}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              >
                <option value="">日</option>
                {Array.from(
                  { length: getDaysInMonth(form.dob_year, form.dob_month) },
                  (_, i) => i + 1
                ).map((d) => (
                  <option key={d} value={d}>{d} 日</option>
                ))}
              </select>
            </div>
          </div>

          {/* 入学年份 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              入学年份 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="2000"
              max="2040"
              value={form.intake_year}
              onChange={(e) => setForm((p) => ({ ...p, intake_year: e.target.value }))}
              placeholder="如：2026"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          {/* 最大预算 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              最大预算（马币） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.max_budget}
              onChange={(e) => setForm((p) => ({ ...p, max_budget: e.target.value }))}
              placeholder="如：50000"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          {/* 体系 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              体系 <span className="text-zinc-400">（选填，可多选）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CURRICULUM_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={form.curricula.includes(o.value)}
                    onChange={() => toggleCurriculum(o.value)}
                    className="rounded border-zinc-400"
                  />
                  <span className="text-zinc-900 dark:text-zinc-100">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 住宿 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              住宿 <span className="text-zinc-400">（选填，可多选）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={form.rooms.includes(o.value)}
                    onChange={() => toggleRoom(o.value)}
                    className="rounded border-zinc-400"
                  />
                  <span className="text-zinc-900 dark:text-zinc-100">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 签证 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              签证 <span className="text-zinc-400">（选填，可多选）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VISA_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={form.visas.includes(o.value)}
                    onChange={() => toggleVisa(o.value)}
                    className="rounded border-zinc-400"
                  />
                  <span className="text-zinc-900 dark:text-zinc-100">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 最小预算 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              最小预算（马币） <span className="text-zinc-400">（选填）</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.min_budget}
              onChange={(e) => setForm((p) => ({ ...p, min_budget: e.target.value }))}
              placeholder="不填则不限制"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? '匹配中…' : '开始匹配'}
          </button>
        </form>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {submitted && !loading && !error && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">匹配结果</h2>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>汇率 1 马币 =</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="10"
                  value={myrToCny}
                  onChange={(e) => setMyrToCny(Number(e.target.value) || DEFAULT_MYR_TO_CNY)}
                  className="w-16 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
                <span>人民币</span>
              </label>
              {selectedSchools.size > 0 && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  已勾选 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedSchools.size}</span> 所学校，点击右上角购物车查看
                </span>
              )}
            </div>

            {resultsByCurriculum.every((g) => g.schools.length === 0) ? (
              <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:py-12">
                暂无匹配学校，可尝试调整条件后再试。
              </div>
            ) : (
              <div className="space-y-6">
                {resultsByCurriculum.map((group) => {
                  if (group.schools.length === 0) return null
                  const style = getCurriculumStyle(group.curriculum)
                  return (
                    <section
                      key={group.curriculum}
                      className={`rounded-xl border-2 ${style.border} ${style.bg} overflow-hidden`}
                    >
                      <div className={`px-4 py-3 font-semibold ${style.header}`}>
                        <span className="mr-4">{group.curriculumLabel}</span>
                        <span className="text-sm font-normal opacity-90">
                          年龄：{age != null ? `${age} 岁` : '—'} · 年级：{group.schools[0]?.grade_display || '—'}
                        </span>
                      </div>
                      <ul className="space-y-2 p-4">
                        {group.schools.map((school, index) => {
                          const t = formatTuition(school.tuition_amount, myrToCny)
                          const selected = isSchoolSelected(school)
                          const detailUrl = detailUrlFor(school.school_name_en)
                          const handleCardClick = () => {
                            if (detailUrl) window.open(detailUrl, '_blank', 'noopener')
                          }
                          return (
                            <li
                              key={school.id ?? index}
                              onClick={handleCardClick}
                              className={`relative rounded-lg border bg-white p-4 pr-10 dark:bg-zinc-800 transition-shadow
                                ${selected
                                  ? 'border-zinc-900 dark:border-zinc-300'
                                  : 'border-zinc-200 dark:border-zinc-700'
                                }
                                ${detailUrl ? 'cursor-pointer hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-500' : ''}
                              `}
                            >
                              {/* 勾选框 */}
                              <label
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleSchool(school)}
                                  className="h-4 w-4 cursor-pointer rounded border-zinc-400 accent-zinc-900 dark:accent-zinc-100"
                                />
                              </label>

                              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                                {school.school_name_cn || '—'}
                              </h3>
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                {school.school_name_en || '—'}
                              </p>
                              <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                学费：{t.myr}
                                {t.cny && (
                                  <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                                    {t.cny}
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                住宿：{school.room ?? '—'}
                              </p>
                              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                签证：{school.visa ?? '—'}
                              </p>
                              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                可入学月份：{school.intake_months ?? '—'}
                              </p>
                              {detailUrl && (
                                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                  查看详情 ↗
                                </p>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
