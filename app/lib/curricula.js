// 课程体系注册表
// 显示顺序（按 DB 字段值），空体系会被跳过
export const CURRICULUM_ORDER = ['IB', 'UK', 'OSSD', 'AUS', 'US']

// DB 值 → 用户看到的标签（US 在用户侧统一显示为 AP，其他原样）
export const CURRICULUM_LABELS = {
  IB: 'IB',
  UK: 'UK',
  OSSD: 'OSSD',
  AUS: 'AUS',
  US: 'AP',
}

// DB 值 → 体系介绍 HTML 文件名（放在 public/curriculum/ 下）
export const CURRICULUM_INTRO_FILES = {
  IB: 'IB.html',
  UK: 'UK.html',
  OSSD: 'OSSD.html',
  AUS: 'AUS.html',
  US: 'AP.html', // US 数据走 AP 体系介绍
}

export function curriculumLabelFor(value) {
  return CURRICULUM_LABELS[value] || value || '—'
}

export function curriculumIntroUrlFor(value) {
  const f = CURRICULUM_INTRO_FILES[value]
  return f ? `/curriculum/${f}` : null
}
