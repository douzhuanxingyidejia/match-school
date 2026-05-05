// 学校详情 · 多页 PDF 资源注册表
// 与 school-details.js（单页 HTML）并存,专供"导出 PDF"使用。
// key 必须等于 Supabase tuition.school_name_en（保留空格、智能引号、破折号、NBSP 等）。
// value 是该校 HTML 文件名"基名"（不含 _1.html / _2.html 后缀），按页码顺序生成 URL。
// 文件位置：public/schools-pages/<base>_1.html, <base>_2.html  …
// 文件名为中文,URL 通过 encodeURIComponent 处理,各浏览器/Next 静态资源可正常访问。

const SCHOOL_PAGE_BASENAME = {
  // KL / Selangor
  "Beaconhouse Sri Inai International School": "Beaconhouse国际学校",
  "Crescendo-HELP International School": "Crescendo-HELP国际学校",
  "ELC International Schools": "ELC国际学校",
  "HELP International School": "HELP精英国际学校",
  "IGB International School（IGBIS）": "IGB国际学校",
  "The International School @ ParkCity（ISP）": "ISP国际学校",
  "Sri KDU International School — Klang": "KDU国际学校巴生校区",
  "Sri KDU International School — Subang Jaya": "KDU国际学校梳邦校区",
  "Sri KDU International School — Penang": "KDU国际学校槟城校区",
  "Sri KDU International School — Kota Damansara": "KDU国际学校白沙罗高原校区",
  "Kolej Tuanku Ja'afar (KTJ) international school ": "KTJ国际学校",
  "Nexus International School Malaysia": "NEXUS莱仕国际学校",
  "REAL Schools International School": "REAL新山国际学校",
  "Reigate Grammar School Kuala Lumpur（RGSKL）": "Reigate Grammar国际学校",
  "Soka International School Malaysia": "SOKA创价国际学校",
  "UCSI International School Kuala Lumpur": "UCSI思特雅国际学校吉隆坡校区",
  "UCSI International School ( SpringHill Campus)": "UCSI思特雅国际学校春泉镇校区",
  "EATON International School ": "伊顿国际学校",
  "Concord College International School": "协和国际学校",
  "Sunway International Schools — Canadian Ontario": "双威国际学校吉隆坡校区",
  "Sunway International School（新山校区）": "双威国际学校新山校区",
  "The International School of Kuala Lumpur": "吉隆坡国际学校",
  "The British International School Kuala Lumpur": "吉隆坡英国国际学校",
  "St. Joseph’s Institution International School Malaysia (SJIIS)": "圣约瑟夫国际学校",
  "Australian International School Malaysia": "大马澳洲人国际学校",
  "Charterhouse School": "查特豪斯马来西亚国际学校",
  "Forest City International School": "森林城市国际学校",
  "Taylor's International School Kuala Lumpur": "泰莱国际学校",
  "Mont'Kiara International School (M'KIS) ": "满家乐国际学校",
  "The Alice Smith School": "爱丽丝史密斯国际学校",
  "Epsom College in Malaysia": "爱普森国际学校",
  "MAHSA INTERNATIONAL SCHOOL": "玛莎国际学校",
  "Oasis International School": "绿洲国际学校",
  "Tenby International School Setia EcoHill": "腾比赛蒂国际学校",
  "Garden International School": "花园国际学校",
  "Raffles American School": "莱佛士美国学校",
  "Nobel International School": "诺贝尔国际学校",
  "Sayfol International School, SIS": "赛福国际学校",
  " Kingsgate International School": "金斯盖特国际学校",
  "Adcote Matrix International School": "阿德克特国际学校",
  "FAIRVIEW International School ": "飞优国际学校",
  "Marlborough College Malaysia": "马尔伯勒国际学校",
  // Penang
  "Stonyhurst International School Penang": "槟城Stonyhurst国际学校",
  "Straits International School - Penang": "槟城海峡国际学校",
  "Prince of Wales Island International School": "槟城王子岛国际学校",
  "Tenby Schools Penang": "槟城腾比国际学校",
  "The International School of Penang (Uplands)": "槟城高地国际学校",
}

// King Henry VIII（KH8..KH22）共用同一份 PDF
for (let i = 8; i <= 22; i++) {
  SCHOOL_PAGE_BASENAME[`King Henry VIII College（KH${i}）`] = '亨利八世国际学校'
}

export { SCHOOL_PAGE_BASENAME }

export function schoolPageUrlsFor(school_name_en) {
  if (!school_name_en) return []
  const base = SCHOOL_PAGE_BASENAME[school_name_en]
  if (!base) return []
  // 默认每所学校 2 页
  return [1, 2].map((n) => `/schools-pages/${encodeURIComponent(`${base}_${n}.html`)}`)
}
