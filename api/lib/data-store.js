import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const DATA_DIR = path.join(process.cwd(), "api", "_data");
const ASSET_DIR = path.join(process.cwd(), "api", "_assets");

const GLOBAL_FILES = {
  marketPerformanceSnapshot: "performance-snapshot.js",
  dailyBriefing: "daily-briefing.js",
  selfReportLatest: "self-report-latest.js",
  selfReportHistory: "self-report-history.js",
  financialReportLatest: "financial-report-latest.js",
  financialReportHistory: "financial-report-history.js",
  irSummaryHistory: "ir-summary-history.js",
  twRevenueLatest: "tw-revenue-latest.js",
  twInsiderHoldingLatest: "insider-holding-latest.js",
};

async function readWindowAssignment(globalName) {
  const file = GLOBAL_FILES[globalName];
  if (!file) return null;
  const source = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: file, timeout: 1000 });
  if (sandbox.window[globalName] == null) throw new Error(`Could not parse ${file}`);
  return sandbox.window[globalName];
}

function protectSelfReportImage(payload) {
  const clone = structuredClone(payload);
  const image = String(clone.image || "");
  const match = image.match(/(?:^|\/)assets\/self-report\/([^/?#]+)$/);
  if (match) {
    clone.image = `/api/private-asset?feature=tw_self_report&path=${encodeURIComponent(`self-report/${match[1]}`)}`;
  }
  return clone;
}

export async function readDashboardData(permissions) {
  const data = {};
  const needsPerformance = [
    "us_events",
    "us_learning",
    "us_watchlist",
    "tw_insider",
    "tw_self_report",
    "tw_financial_report",
    "tw_ir_summary",
    "tw_revenue",
  ].some((feature) => permissions[feature]);

  if (needsPerformance) {
    data.marketPerformanceSnapshot = await readWindowAssignment("marketPerformanceSnapshot");
  }
  if (permissions.daily_briefing) {
    data.dailyBriefing = await readWindowAssignment("dailyBriefing");
  }
  if (permissions.tw_self_report) {
    data.selfReportLatest = protectSelfReportImage(await readWindowAssignment("selfReportLatest"));
    data.selfReportHistory = await readWindowAssignment("selfReportHistory");
  }
  if (permissions.tw_financial_report) {
    data.financialReportLatest = await readWindowAssignment("financialReportLatest");
    data.financialReportHistory = await readWindowAssignment("financialReportHistory");
  }
  if (permissions.tw_ir_summary) {
    data.irSummaryHistory = await readWindowAssignment("irSummaryHistory");
  }
  if (permissions.tw_revenue) {
    data.twRevenueLatest = await readWindowAssignment("twRevenueLatest");
  }
  if (permissions.tw_insider) {
    data.twInsiderHoldingLatest = await readWindowAssignment("twInsiderHoldingLatest");
  }
  return data;
}

export async function readPrivateAsset(assetPath) {
  const normalized = String(assetPath || "").replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;
  const resolved = path.resolve(ASSET_DIR, normalized);
  if (!resolved.startsWith(path.resolve(ASSET_DIR))) return null;
  return fs.readFile(resolved);
}

export function privateAssetContentType(assetPath) {
  const ext = path.extname(String(assetPath || "")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}
