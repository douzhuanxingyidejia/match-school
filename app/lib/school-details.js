// 学校详情页注册表
// key 必须完全等于 Supabase tuition 表里的 school_name_en（保留所有标点、空格、破折号）。
// 注意：
//   - St. Joseph’s 用智能引号 U+2019（’），不是普通单引号 '
//   - Sunway 系列、KDU 系列用 em-dash U+2014（—）
//   - 部分名字尾部/首部有空格（EATON、KTJ、FAIRVIEW、Mont'Kiara、Kingsgate），保持原样
// 添加新学校时：把详情 HTML 放到 public/schools/<slug>.html，然后在下面加一行映射。
export const SCHOOL_DETAIL_FILES = {
  "Beaconhouse Sri Inai International School": "beaconhouse.html",
  "Crescendo-HELP International School": "crescendo-help.html",
  "ELC International Schools": "elc.html",
  "HELP International School": "help-international.html",
  "The International School @ ParkCity（ISP）": "isp-parkcity.html",
  "Sri KDU International School — Klang": "kdu-klang.html",
  "Sri KDU International School — Subang Jaya": "kdu-subang.html",
  "Sri KDU International School — Penang": "kdu-penang.html",
  "Sri KDU International School — Kota Damansara": "kdu-kota-damansara.html",
  "Kolej Tuanku Ja'afar (KTJ) international school ": "ktj.html",
  "Nexus International School Malaysia": "nexus.html",
  "REAL Schools International School": "real-jb.html",
  "Reigate Grammar School Kuala Lumpur（RGSKL）": "reigate.html",
  "Soka International School Malaysia": "soka.html",
  "UCSI International School Kuala Lumpur": "ucsi-kl.html",
  "UCSI International School ( SpringHill Campus)": "ucsi-springhill.html",
  "King Henry VIII College（KH8）": "king-henry.html",
  "King Henry VIII College（KH9）": "king-henry.html",
  "King Henry VIII College（KH10）": "king-henry.html",
  "King Henry VIII College（KH11）": "king-henry.html",
  "King Henry VIII College（KH12）": "king-henry.html",
  "King Henry VIII College（KH13）": "king-henry.html",
  "King Henry VIII College（KH14）": "king-henry.html",
  "King Henry VIII College（KH15）": "king-henry.html",
  "King Henry VIII College（KH16）": "king-henry.html",
  "King Henry VIII College（KH17）": "king-henry.html",
  "King Henry VIII College（KH18）": "king-henry.html",
  "King Henry VIII College（KH19）": "king-henry.html",
  "King Henry VIII College（KH20）": "king-henry.html",
  "King Henry VIII College（KH21）": "king-henry.html",
  "King Henry VIII College（KH22）": "king-henry.html",
  "EATON International School ": "eaton.html",
  "Concord College International School": "concord.html",
  "Sunway International Schools — Canadian Ontario": "sunway-kl.html",
  "Sunway International School（新山校区）": "sunway-jb.html",
  "The International School of Kuala Lumpur": "iskl.html",
  "The British International School Kuala Lumpur": "bsi-kl.html",
  "St. Joseph’s Institution International School Malaysia (SJIIS)": "sji-international.html",
  "Australian International School Malaysia": "aism.html",
  "Charterhouse School": "charterhouse.html",
  "Forest City International School": "forest-city.html",
  "Stonyhurst International School Penang": "stonyhurst-penang.html",
  "Straits International School - Penang": "straits-penang.html",
  "Prince of Wales Island International School": "pwiis.html",
  "Tenby Schools Penang": "tenby-penang.html",
  "The International School of Penang (Uplands)": "uplands-penang.html",
  "Taylor's International School Kuala Lumpur": "taylors-kl.html",
  // 注意：DB 这条 EN 名里 "Kiara" / "School" / 末尾的空格其实是 NBSP (U+00A0)，不是普通空格
  "Mont'Kiara International School (M'KIS) ": "mkis.html",
  "Peninsula International School Australia (PISA)": "pisa.html",
  "The Alice Smith School": "alice-smith.html",
  "Epsom College in Malaysia": "epsom.html",
  "MAHSA INTERNATIONAL SCHOOL": "mahsa.html",
  "Oasis International School": "oasis.html",
  "Tenby International School Setia EcoHill": "tenby-setia.html",
  "Garden International School": "garden-international.html",
  "IGB International School（IGBIS）": "igb.html",
  "Raffles American School": "raffles-american.html",
  "Nobel International School": "nobel.html",
  "Sayfol International School, SIS": "sayfol.html",
  " Kingsgate International School": "kingsgate.html",
  "Adcote Matrix International School": "adcote.html",
  "FAIRVIEW International School ": "fairview.html",
  "Marlborough College Malaysia": "marlborough.html",
}

export function detailUrlFor(school_name_en) {
  if (!school_name_en) return null
  const f = SCHOOL_DETAIL_FILES[school_name_en]
  return f ? `/schools/${f}` : null
}
