// 学校详情页注册表
// key 必须完全等于 Supabase tuition 表里的 school_name_en（保留所有标点、空格、破折号）。
// 注意：St. Joseph’s 用的是智能引号 U+2019（’），不是普通单引号 '；Sunway 用 em-dash U+2014（—），不是普通连字符。
// 添加新学校时：把详情 HTML 放到 public/schools/<slug>.html，然后在下面加一行映射。
export const SCHOOL_DETAIL_FILES = {
  'The Alice Smith School': 'alice-smith.html',
  'Garden International School': 'garden-international.html',
  'St. Joseph’s Institution International School Malaysia (SJIIS)': 'sji-international.html',
  'Sunway International Schools — Canadian Ontario': 'sunway-kl.html',
}

export function detailUrlFor(school_name_en) {
  if (!school_name_en) return null
  const f = SCHOOL_DETAIL_FILES[school_name_en]
  return f ? `/schools/${f}` : null
}
