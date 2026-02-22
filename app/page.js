'use client'

import { useEffect, useState } from 'react'

function formatTuition(num) {
  if (num == null || num === '') return '—'
  const n = Number(num)
  if (!Number.isFinite(n)) return String(num)
  return `${n.toLocaleString('en-US')} 马币`
}

export default function Home() {
  const [schools, setSchools] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSchools() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dob: '2019-03-10',
            intake_year: 2025,
            max_budget: 50000,
            city: '新山',
            curriculum: 'UK',
            min_budget: null,
          }),
        })
        const json = await res.json()
        if (!json.success) {
          setError(json.error || json.body || '请求失败')
          return
        }
        setSchools(json.data || [])
      } catch (e) {
        setError(e?.message || '网络或请求异常')
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
          学校匹配结果
        </h1>

        {loading && (
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-6 dark:border-zinc-700 dark:bg-zinc-800 sm:py-8">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">加载中…</span>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && schools.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:py-12">
            暂无匹配学校，可尝试调整条件后再试。
          </div>
        )}

        {!loading && !error && schools.length > 0 && (
          <ul className="space-y-3 sm:space-y-4">
            {schools.map((school, index) => (
              <li
                key={school.id ?? index}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:p-5"
              >
                <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 sm:text-lg">
                  {school.school_name_cn || '—'}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {school.school_name_en || '—'}
                </p>
                <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  学费：{formatTuition(school.tuition_amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
