// 课程体系 · 多页 PDF 资源注册表
// 与 curricula.js（单页 HTML 介绍）并存,专供"导出 PDF"使用。
// 每个体系对应一组按页码排序的 HTML（一张 HTML = 一页 PDF）。
// 文件位置：public/curriculum-pages/<filename>,URL 即 /curriculum-pages/<filename>。

export const CURRICULUM_PAGE_FILES = {
  IB:   ['IB_1.html', 'IB_2.html', 'IB_3.html'],
  UK:   ['UK_1.html', 'UK_2.html', 'UK_3.html'],
  OSSD: ['OSSD_1.html', 'OSSD_2.html', 'OSSD_3.html'],
  AUS:  ['AUS_1.html', 'AUS_2.html', 'AUS_3.html'],
  US:   ['AP_1.html', 'AP_2.html', 'AP_3.html'], // US 数据走 AP 体系介绍
}

export function curriculumPageUrlsFor(value) {
  const arr = CURRICULUM_PAGE_FILES[value]
  if (!Array.isArray(arr) || arr.length === 0) return []
  // 文件名是英文,URL 直接拼即可
  return arr.map((f) => `/curriculum-pages/${f}`)
}
