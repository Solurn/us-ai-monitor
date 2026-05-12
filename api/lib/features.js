export const FEATURES = [
  { key: "us_events", label: "美股事件日曆", market: "US" },
  { key: "us_learning", label: "技術/產業學習", market: "US" },
  { key: "us_watchlist", label: "美股個股卡片", market: "US" },
  { key: "tw_insider", label: "台股內部人持股", market: "TW" },
  { key: "tw_self_report", label: "自結速報", market: "TW" },
  { key: "tw_financial_report", label: "財報公告", market: "TW" },
  { key: "tw_ir_summary", label: "法說摘要", market: "TW" },
  { key: "tw_revenue", label: "營收資訊", market: "TW" },
  { key: "daily_briefing", label: "每日摘要", market: "US" },
];

export const FEATURE_KEYS = new Set(FEATURES.map((feature) => feature.key));

export function normalizePermissions(rows = []) {
  const permissions = Object.fromEntries(FEATURES.map((feature) => [feature.key, false]));
  for (const row of rows) {
    if (FEATURE_KEYS.has(row.feature_key)) {
      permissions[row.feature_key] = Boolean(row.enabled);
    }
  }
  return permissions;
}

export function hasAnyFeature(permissions = {}) {
  return FEATURES.some((feature) => permissions[feature.key]);
}
