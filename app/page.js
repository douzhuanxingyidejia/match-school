'use client'

import { useState } from 'react'

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

/** 由年/月/日拼成 YYYY-MM-DD，无效则返回 null */
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

/** 根据出生日期和入学年份估算入学年龄（岁） */
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

/** 年龄 → 年级称呼（英式/国际常用） */
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

export default function Home() {
  const [resultsByCurriculum, setResultsByCurriculum] = useState([]) // [{ curriculum, curriculumLabel, schools }]
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
  })

  const toggleCity = (city) => {
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }))
  }

  const toggleCurriculum = (value) => {
    setForm((prev) => ({
      ...prev,
      curricula: prev.curricula.includes(value)
        ? prev.curricula.filter((c) => c !== value)
        : [...prev.curricula, value],
    }))
  }

  const toggleRoom = (value) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.includes(value)
        ? prev.rooms.filter((r) => r !== value)
        : [...prev.rooms, value],
    }))
  }

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
    // 未选或全选均视为不限，只选一个时才传具体值
    const room = form.rooms.length === 1 ? form.rooms[0] : null

    if (!cities.length) {
      setError('请至少选择一个城市')
      return
    }
    if (!dob) {
      setError('请选择出生年、月、日')
      return
    }
    if (!Number.isFinite(intakeYear) || intakeYear < 2000 || intakeYear > 2040) {
      setError('请填写有效的入学年份（如 2026）')
      return
    }
    if (maxBudget == null || !Number.isFinite(maxBudget) || maxBudget < 0) {
      setError('请填写最大预算')
      return
    }
    if (minBudget != null && Number.isFinite(minBudget) && minBudget > maxBudget) {
      setError('最小预算不能大于最大预算')
      return
    }

    setLoading(true)
    try {
      const curriculumLabels = { null: '不限定' }
      CURRICULUM_OPTIONS.forEach((o) => (curriculumLabels[o.value] = o.label))

      const byCurriculum = {} // curriculum -> Set of schools (dedupe by id or name_cn)
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
            }),
          })
          const json = await res.json()
          if (!json.success) {
            setError(json.error || json.body || '请求失败')
            return
          }
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
          学校匹配
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-5">
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
                  <option key={y} value={y}>
                    {y} 年
                  </option>
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
                  <option key={m} value={m}>
                    {m} 月
                  </option>
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
                  <option key={d} value={d}>
                    {d} 日
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                匹配结果
              </h2>
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
                          年龄：{age != null ? `${age} 岁` : '—'} · 年级：{gradeLabel}
                        </span>
                      </div>
                      <ul className="space-y-2 p-4">
                        {group.schools.map((school, index) => {
                          const t = formatTuition(school.tuition_amount, myrToCny)
                          return (
                            <li
                              key={school.id ?? index}
                              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                            >
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
