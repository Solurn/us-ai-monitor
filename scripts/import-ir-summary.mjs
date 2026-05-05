import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultIrRoot = path.resolve(root, "..", "法說整理");
const irRoot = process.env.IR_SUMMARY_ROOT ? path.resolve(process.env.IR_SUMMARY_ROOT) : defaultIrRoot;
const reportDir = path.join(irRoot, "reports");
const outputDir = path.join(root, "web", "data");
const outputPath = path.join(outputDir, "ir-summary-history.js");
const retentionDays = Number(process.env.IR_SUMMARY_RETENTION_DAYS ?? 30);
const maxMeetingDate = process.env.IR_SUMMARY_MAX_DATE || "";

function taipeiTodayIso(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDateIso(dateIso, days) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseLink(value) {
  const match = String(value ?? "").match(/\[link\]\(([^)]+)\)/);
  return match ? match[1] : "";
}

function parseInlineValue(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`^- ${escaped}：(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function parseBullets(sectionText) {
  return String(sectionText ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function sectionAfter(block, heading) {
  const match = block.match(new RegExp(`\\n#{2,3}\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n`));
  if (!match || match.index == null) return "";
  const rest = block.slice(match.index + match[0].length);
  const next = rest.search(/\n#{2,3}\s+/);
  return next >= 0 ? rest.slice(0, next) : rest;
}

function evaluateOutlookTone(outlookBullets, summaryBullets) {
  const text = [...(outlookBullets ?? []), ...(summaryBullets ?? [])].join(" ").toLowerCase();
  if (!text.trim()) return { label: "\u4e2d\u6027\u89c0\u671b", score: 50, basis: "\u7f3a\u5c11\u53ef\u8a55\u4f30\u7684\u5c55\u671b\u5167\u5bb9" };
  const positiveTerms = [
    "\u6210\u9577", "\u589e\u52a0", "\u63d0\u5347", "\u5f37\u52c1", "\u65fa\u76db", "\u53d7\u60e0", "\u52d5\u80fd", "\u56de\u5347", "\u6539\u5584", "\u64f4\u5f35",
    "\u9700\u6c42\u6301\u7e8c", "\u8a02\u55ae", "po", "guidance", "growth", "increase", "strong", "improve",
    "mid-teens", "double digit", "\u9ad8\u9ede", "\u5275\u9ad8", "\u91cf\u7522", "\u5c0e\u5165", "\u8ca2\u737b", "\u770b\u597d",
  ];
  const negativeTerms = [
    "\u4e0b\u6ed1", "\u8870\u9000", "\u6e1b\u5c11", "\u4fdd\u5b88", "\u653e\u7de9", "\u58d3\u529b", "\u4e0d\u78ba\u5b9a", "\u98a8\u96aa", "\u8667\u640d",
    "\u672a\u63ed\u9732", "\u672a\u63d0\u4f9b", "\u7121\u660e\u78ba", "\u6c92\u6709\u660e\u78ba", "\u4ecd\u5f85", "\u6311\u6230", "decline", "decrease",
    "weak", "risk", "uncertain", "pressure", "loss",
  ];
  const countMatches = (terms) => terms.reduce((count, term) => count + (text.includes(term.toLowerCase()) ? 1 : 0), 0);
  const positive = countMatches(positiveTerms);
  const negative = countMatches(negativeTerms);
  const score = Math.max(0, Math.min(100, 50 + positive * 7 - negative * 6));
  let label = "\u4e2d\u6027\u89c0\u671b";
  if (score >= 70) label = "\u6b63\u9762\u770b\u597d";
  else if (score >= 57) label = "\u4e2d\u6027\u504f\u6b63\u9762";
  else if (score <= 30) label = "\u8ca0\u9762";
  else if (score <= 43) label = "\u4fdd\u5b88\u504f\u8ca0\u9762";
  return { label, score, basis: `\u6b63\u5411\u8a0a\u865f ${positive}\u3001\u4fdd\u5b88\u8a0a\u865f ${negative}` };
}

function buildDetailedMarkdown(row) {
  const tone = row.outlookTone ?? {};
  const summary = (row.summaryBullets ?? []).filter(Boolean);
  const outlook = (row.outlookBullets ?? []).filter(Boolean);
  const transcriptStatus = row.transcriptStatus || row.mediaStatus || "\u672a\u63ed\u9732";
  const hasTranscript = String(transcriptStatus).startsWith("\u6210\u529f");
  const sourceNote = hasTranscript
    ? "\u672c\u6b21\u8a55\u4f30\u512a\u5148\u4f9d\u8a9e\u97f3\u8f49\u9304\u5167\u5bb9\uff0c\u518d\u8207\u7c21\u5831\u91cd\u9ede\u4ea4\u53c9\u6bd4\u5c0d\u3002"
    : "\u672c\u6b21\u5c1a\u672a\u53d6\u5f97\u53ef\u7528\u8a9e\u97f3\u8f49\u9304\uff0c\u8a55\u4f30\u4e3b\u8981\u4f9d\u7c21\u5831\u8207 MOPS \u64c7\u8981\u8a0a\u606f\u3002";
  const positivePattern = /成長|增加|提升|強勁|需求|訂單|高點|量產|導入|貢獻|看好|AI|data center|hyperscaler|growth|strong|improve/i;
  const cautionPattern = /未揭露|未提供|不確定|風險|保守|下滑|壓力|放緩|仍待|可能|挑戰|risk|pressure|uncertain/i;
  const positives = outlook.filter((item) => positivePattern.test(item)).slice(0, 5);
  const caveats = [...outlook, ...summary].filter((item) => cautionPattern.test(item)).slice(0, 5);
  const lines = [
    `## ${row.code} ${row.name} \u8a73\u7d30\u6458\u8981`,
    "",
    "### \u5224\u8b80\u7d50\u8ad6",
    `- \u5c55\u671b\u8a55\u50f9\uff1a${tone.label || "\u4e2d\u6027\u89c0\u671b"}${Number.isFinite(Number(tone.score)) ? `\uff08${tone.score} \u5206\uff09` : ""}\u3002`,
    `- \u8cc7\u6599\u57fa\u790e\uff1a${sourceNote}`,
    `- \u8a55\u5206\u4f9d\u64da\uff1a${tone.basis || "\u5c1a\u672a\u6709\u660e\u78ba\u8a55\u5206\u8a0a\u865f"}\u3002`,
    "",
    "### \u6703\u8b70\u8108\u7d61",
    ...(summary.slice(0, 6).length ? summary.slice(0, 6).map((item) => `- ${item}`) : ["- \u5c1a\u672a\u64f7\u53d6\u5230\u8db3\u5920\u7684\u6703\u8b70\u6458\u8981\u3002"]),
    "",
    "### \u5c55\u671b\u8207\u5229\u57fa",
    ...(outlook.slice(0, 8).length ? outlook.slice(0, 8).map((item) => `- ${item}`) : ["- \u5c1a\u672a\u64f7\u53d6\u5230\u660e\u78ba\u5c55\u671b\u6bb5\u843d\u3002"]),
    "",
    "### \u5206\u6578\u5229\u57fa\u9ede",
    ...(positives.length ? positives.map((item) => `- ${item}`) : ["- \u76ee\u524d\u672a\u770b\u5230\u8db3\u5920\u660e\u78ba\u7684\u6b63\u5411\u5c55\u671b\u8a0a\u865f\uff0c\u56e0\u6b64\u5206\u6578\u8f03\u504f\u4e2d\u6027\u3002"]),
    "",
    "### \u9700\u8981\u4fdd\u7559\u7684\u7591\u616e",
    ...(caveats.length ? caveats.map((item) => `- ${item}`) : ["- \u76ee\u524d\u6458\u8981\u4e2d\u672a\u51fa\u73fe\u660e\u986f\u8ca0\u5411\u6216\u4fdd\u5b88\u8a0a\u865f\uff0c\u4f46\u4ecd\u9700\u7559\u610f\u516c\u53f8\u672a\u91cf\u5316\u63ed\u9732\u7684\u90e8\u5206\u3002"]),
  ];
  return lines.join("\n");
}

function parseReport(markdown, reportFile) {
  const text = stripBom(markdown);
  const blocks = text.split(/\n(?=## \d{4}-\d{2}-\d{2} )/g);
  const rows = [];
  for (const block of blocks) {
    const title = block.match(/^## (\d{4}-\d{2}-\d{2})\s+(\d{4,6})\s+(.+?)（(.+?)）/m);
    if (!title) continue;
    const [, meetingDate, code, name, eventType] = title;
    const transcriptLine = parseInlineValue(block, "語音轉錄");
    const mediaValue = parseInlineValue(block, "影音");
    const outlookBullets = parseBullets(sectionAfter(block, "展望重點"));
    const summaryBullets = parseBullets(sectionAfter(block, "會議重點摘要"));
    const row = {
      date: meetingDate,
      code,
      name,
      eventType,
      time: parseInlineValue(block, "時間"),
      location: parseInlineValue(block, "地點"),
      topic: parseInlineValue(block, "MOPS 擇要"),
      companyWebsite: parseLink(parseInlineValue(block, "公司網站")),
      chinesePdf: parseLink(parseInlineValue(block, "中文簡報")),
      englishPdf: parseLink(parseInlineValue(block, "英文簡報")),
      mediaUrl: parseLink(mediaValue),
      mediaStatus: mediaValue.includes("缺") ? "缺影音" : mediaValue ? "有影音" : "未揭露",
      transcriptStatus: transcriptLine || (mediaValue && !mediaValue.includes("缺") ? "未產生" : "缺影音"),
      outlookBullets: outlookBullets.length ? outlookBullets : parseBullets(sectionAfter(block, "展望")),
      outlookTone: evaluateOutlookTone(outlookBullets, summaryBullets),
      summaryBullets,
      sourceReport: path.relative(root, reportFile).replaceAll("\\", "/"),
    };
    row.detailMarkdown = buildDetailedMarkdown(row);
    rows.push(row);
  }
  return rows;
}

async function readExistingHistory() {
  try {
    const text = await fs.readFile(outputPath, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(text, sandbox);
    return sandbox.window.irSummaryHistory?.items ?? [];
  } catch {
    return [];
  }
}

function mergeByDate(existingItems, rows, generatedAt) {
  const byDate = new Map();
  for (const item of existingItems) {
    if (item?.queryDate) byDate.set(item.queryDate, { ...item, rows: item.rows ?? [] });
  }
  for (const row of rows) {
    if (maxMeetingDate && String(row.date) > maxMeetingDate) continue;
    const item = byDate.get(row.date) ?? {
      generatedAt,
      queryDate: row.date,
      displayDate: row.date,
      count: 0,
      rows: [],
    };
    const rowMap = new Map((item.rows ?? []).map((oldRow) => [String(oldRow.code), oldRow]));
    rowMap.set(String(row.code), row);
    item.rows = Array.from(rowMap.values()).sort((a, b) => Number(a.code) - Number(b.code));
    item.count = item.rows.length;
    item.generatedAt = generatedAt;
    byDate.set(row.date, item);
  }
  const cutoff = shiftDateIso(taipeiTodayIso(), -retentionDays + 1);
  return Array.from(byDate.values())
    .map((item) => ({
      ...item,
      rows: (item.rows ?? []).map((row) => ({
        ...row,
        detailMarkdown: row.detailMarkdown || buildDetailedMarkdown(row),
      })),
    }))
    .filter((item) => String(item.queryDate) >= cutoff)
    .filter((item) => !maxMeetingDate || String(item.queryDate) <= maxMeetingDate)
    .sort((a, b) => String(b.queryDate).localeCompare(String(a.queryDate)));
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  let files = [];
  try {
    files = await fs.readdir(reportDir);
  } catch {
    throw new Error(`IR report directory not found: ${reportDir}`);
  }

const reportFiles = (
  await Promise.all(
    files
      .filter((file) => /^ir_summary_\d{4}-\d{2}-\d{2}\.md$/.test(file))
      .map(async (file) => {
        const fullPath = path.join(reportDir, file);
        const stat = await fs.stat(fullPath);
        return { fullPath, mtimeMs: stat.mtimeMs };
      }),
  )
)
  .sort((a, b) => a.mtimeMs - b.mtimeMs || a.fullPath.localeCompare(b.fullPath))
  .map((item) => item.fullPath);

  const rows = [];
  for (const file of reportFiles) {
    const markdown = await fs.readFile(file, "utf8");
    rows.push(...parseReport(markdown, file));
  }

  const generatedAt = new Date().toISOString();
  const existing = await readExistingHistory();
  const items = mergeByDate(existing, rows, generatedAt);
  const latest = items[0] ?? {
    generatedAt,
    queryDate: "",
    displayDate: "",
    count: 0,
    rows: [],
  };
  const payload = {
    generatedAt,
    sourceRoot: irRoot,
    retentionDays,
    maxMeetingDate,
    latestDate: latest.queryDate,
    items,
  };

  await fs.writeFile(
    outputPath,
    `window.irSummaryHistory = ${JSON.stringify(payload, null, 2)};\nwindow.irSummaryLatest = ${JSON.stringify(latest, null, 2)};\n`,
    "utf8",
  );
  console.log(`Imported ${rows.length} IR rows into ${outputPath}`);
  console.log(`Dates retained: ${items.map((item) => item.queryDate).join(", ") || "none"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
