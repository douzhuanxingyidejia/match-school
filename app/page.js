'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [schools, setSchools] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSchools() {
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
      }
    }

    fetchSchools()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>学校匹配结果</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {schools.map((school, index) => (
        <div key={index} style={{ marginBottom: 20 }}>
          <h3>{school.school_name_cn}</h3>
          <p>{school.school_name_en}</p>
          <p>学费: {school.tuition_amount}</p>
        </div>
      ))}
    </div>
  )
}