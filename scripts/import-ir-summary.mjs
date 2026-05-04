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
    rows.push({
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
      summaryBullets,
      sourceReport: path.relative(root, reportFile).replaceAll("\\", "/"),
    });
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

const reportFiles = files
  .filter((file) => /^ir_summary_\d{4}-\d{2}-\d{2}\.md$/.test(file))
  .map((file) => path.join(reportDir, file))
  .sort();

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
