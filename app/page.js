'use client'

import { useState, useRef } from 'react'

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
  { value: 'US', label: 'US' },
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
    const curricula = form.curricula.length ? form.curricula : [null]
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

    const handleExportPDF = async () => {
      const element = reportRef.current
      if (!element) return
      try {
        const { default: jsPDF } = await import('jspdf')
        const { default: html2canvas } = await import('html2canvas')
        // 截取隐藏的纯 inline-style div，完全不依赖 Tailwind CSS，无 oklch() 问题
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f9fafb',
        })
        const imgData = canvas.toDataURL('image/png')
        const w = canvas.width / 2
        const h = canvas.height / 2
        const pdf = new jsPDF({
          orientation: w > h ? 'landscape' : 'portrait',
          unit: 'px',
          format: [w, h],
        })
        pdf.addImage(imgData, 'PNG', 0, 0, w, h)
        pdf.save('选校报告.pdf')
      } catch (err) {
        console.error('导出PDF失败:', err)
        alert('导出失败，请重试：' + err.message)
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
                  onClick={handleExportPDF}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  📄 导出 PDF
                </button>
              </div>
            </div>

            {/* 报告内容区（屏幕显示用 Tailwind） */}
            <div className="bg-zinc-50 dark:bg-zinc-900">
            <h1 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">选校报告</h1>

            {/* 学生信息 */}
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">学生信息</h2>
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-3 px-4 py-4 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">学生姓名：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.name || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">学生性别：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.gender || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">入学年份：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{form.intake_year} 年</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">出生日期：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{dobDisplay}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">国籍：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.nationality || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">陪读家长：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.accompanyParent || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">需要陪读签证：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.dependentVisa || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">英语水平：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.englishLevel || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">备注：</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{studentInfo.notes || '—'}</span>
                </div>
              </div>
            </div>

            {/* 学校汇总表 */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-700/60">
                    {['编号', '学校名字', '城市', '课程体系', '就读年级', '是否有住宿', '是否提供签证', '每年学费', '入学月份'].map(
                      (h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {schoolList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-zinc-400">
                        暂无选中的学校
                      </td>
                    </tr>
                  ) : (
                    schoolList.map((school, index) => {
                      const t = formatTuition(school.tuition_amount)
                      return (
                        <tr
                          key={index}
                          className="border-b border-zinc-100 last:border-0 dark:border-zinc-700"
                        >
                          <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                          <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {school.school_name_cn || '—'}
                          </td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{school.city || '—'}</td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{school.curriculum || '—'}</td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                            {school.grade_display || '—'}
                          </td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{school.room || '—'}</td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{school.visa || '—'}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-zinc-700 dark:text-zinc-300">
                            {t.myr}
                          </td>
                          <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                            {school.intake_months || '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              * 本表所列费用基于学校目前官方文件整理，实际费用可能随年度、政策及汇率变化而调整，最终收费标准以学校正式账单或录取通知书为准。
            </p>
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
                          return (
                            <li
                              key={school.id ?? index}
                              className={`relative rounded-lg border bg-white p-4 pr-10 dark:bg-zinc-800 transition-colors
                                ${selected
                                  ? 'border-zinc-900 dark:border-zinc-300'
                                  : 'border-zinc-200 dark:border-zinc-700'
                                }`}
                            >
                              {/* 勾选框 */}
                              <label className="absolute right-3 top-3 cursor-pointer">
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
