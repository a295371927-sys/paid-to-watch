// src/core/ads.js
// 预置假广告模板。越 low 越像牛皮癣 → 伪装越好。
const AD_TEMPLATES = [
  {
    id: 'redpacket',
    title: '🧧 您有一个红包待领取',
    subtitle: '恭喜！系统检测到您可领取 88.88 元',
    button: '立即领取',
    bg: 'linear-gradient(135deg,#ff5f6d,#ffc371)',
  },
  {
    id: 'cleaner',
    title: '⚠️ 检测到 36 个垃圾文件',
    subtitle: '您的电脑运行缓慢，建议立即清理加速',
    button: '一键加速',
    bg: 'linear-gradient(135deg,#36d1dc,#5b86e5)',
  },
  {
    id: 'nearby',
    title: '💃 附近有 3 位用户想认识你',
    subtitle: '距离你 800m，刚刚在线',
    button: '查看详情',
    bg: 'linear-gradient(135deg,#ee9ca7,#ffdde1)',
  },
  {
    id: 'stock',
    title: '📈 这只票今日涨停',
    subtitle: '老股民内部消息，名额仅剩 2 个',
    button: '免费领取',
    bg: 'linear-gradient(135deg,#c31432,#240b36)',
  },
  {
    id: 'sale',
    title: '🛒 全场 9.9 包邮 限时 5 分钟',
    subtitle: '错过再等一年，手慢无',
    button: '马上抢购',
    bg: 'linear-gradient(135deg,#f7971e,#ffd200)',
  },
];

module.exports = { AD_TEMPLATES };
