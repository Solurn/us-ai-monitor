import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultIrRoot = path.resolve(root, "..", "法說整理");
const irRoot = process.env.IR_SUMMARY_ROOT ? path.resolve(process.env.IR_SUMMARY_ROOT) : defaultIrRoot;
const reportDir = path.join(irRoot, "reports");
const outputDir = path.join(root, "api", "_data");
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
  const match = block.match(new RegExp(`\\n#{1,3}\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n`));
  if (!match || match.index == null) return "";
  const rest = block.slice(match.index + match[0].length);
  const next = rest.search(/\n#{1,3}\s+/);
  return next >= 0 ? rest.slice(0, next) : rest;
}

function firstNarrativeBullets(block) {
  const match = block.match(/\n#\s+[^\r\n]+\r?\n/);
  if (!match || match.index == null) return [];
  const rest = block.slice(match.index + match[0].length);
  const next = rest.search(/\n#{1,3}\s+/);
  return parseBullets(next >= 0 ? rest.slice(0, next) : rest);
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

function takeBullets(items, limit = 6) {
  return (items ?? [])
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((other) => other.slice(0, 60) === item.slice(0, 60)) === index)
    .slice(0, limit);
}

function matchBullets(items, terms, limit = 5) {
  const normalizedTerms = terms.map((term) => term.toLowerCase());
  return takeBullets(items, 30)
    .filter((item) => {
      const lowered = item.toLowerCase();
      return normalizedTerms.some((term) => lowered.includes(term));
    })
    .slice(0, limit);
}

function sectionLines(title, bullets, emptyText) {
  return [
    `### ${title}`,
    ...(bullets.length ? bullets.map((item) => `- ${item}`) : [`- ${emptyText}`]),
    "",
  ];
}

function buildDetailedMarkdown(row) {
  const tone = row.outlookTone ?? {};
  const summary = takeBullets(row.summaryBullets, 10);
  const outlook = takeBullets(row.outlookBullets, 10);
  const financialFromReport = takeBullets(row.financialBullets, 8);
  const risksFromReport = takeBullets(row.riskBullets, 8);
  const qnaFromReport = takeBullets(row.qnaBullets, 8);
  const crossChecks = takeBullets(row.crossCheckBullets, 8);
  const allBullets = [...summary, ...financialFromReport, ...outlook, ...risksFromReport, ...qnaFromReport, ...crossChecks];
  const transcriptStatus = row.transcriptStatus || row.mediaStatus || "未揭露";
  const hasTranscript = String(transcriptStatus).startsWith("成功");
  const score = Number(tone.score);
  const scoreText = Number.isFinite(score) ? `（${score} 分）` : "";
  const sourceNote = hasTranscript
    ? "本次評估優先依語音轉錄內容，再與簡報重點交叉比對；若轉錄與簡報數字不一致，以簡報揭露口徑為主。"
    : "本次尚未取得可用語音轉錄，評估主要依簡報與 MOPS 擇要訊息；若後續補入影音，分數與判讀可再更新。";

  const financial = financialFromReport.length ? financialFromReport : matchBullets(allBullets, ["營收", "獲利", "eps", "毛利", "淨利", "ebitda", "現金", "存貨", "負債", "成長", "年增"], 6);
  const business = matchBullets(allBullets, ["產品", "客戶", "市場", "區域", "美國", "歐洲", "中國", "亞太", "ai", "edge", "機器", "醫療", "半導體", "能源", "data center"], 6);
  const qna = qnaFromReport.length ? qnaFromReport : matchBullets(allBullets, ["q&a", "問答", "提問", "毛利率", "成本", "拉貨", "關稅", "供應鏈", "費用", "產能", "訂單"], 6);
  const positiveEvidence = matchBullets(allBullets, ["成長", "提升", "強", "改善", "動能", "案源", "貢獻", "擴充", "受惠", "需求", "正向", "高", "放量", "量產", "growth", "strong", "improve"], 6);
  const cautions = risksFromReport.length || crossChecks.length
    ? takeBullets([...risksFromReport, ...crossChecks], 8)
    : matchBullets(allBullets, ["未揭露", "未提供", "不確定", "保守", "壓力", "成本", "風險", "調整", "下滑", "需人工確認", "缺", "但", "仍需", "uncertain", "risk", "pressure"], 6);

  const conclusion = [];
  conclusion.push(`展望評價：${tone.label || "中性觀望"}${scoreText}。`);
  conclusion.push(`資料基礎：${sourceNote}`);
  conclusion.push(`評分依據：${tone.basis || "尚未有明確評分訊號"}。`);
  if (score >= 70) {
    conclusion.push("判讀：正向訊號較集中，通常代表公司對需求、訂單或產品組合的能見度較高。仍要確認這些動能是否能轉成營收與毛利。 ");
  } else if (score >= 57) {
    conclusion.push("判讀：方向偏正面，但管理層仍保留部分彈性，較適合追蹤接單、毛利率與下一季財測是否延續。 ");
  } else if (score <= 43) {
    conclusion.push("判讀：保守訊號較多，短期需要先確認需求、成本或產業變數是否落底。 ");
  } else {
    conclusion.push("判讀：目前資訊偏中性，正向題材與不確定因素並存，需等待更明確的量化指標。 ");
  }

  const thesis = [];
  if (positiveEvidence.length) {
    thesis.push(`加分主因：${positiveEvidence.slice(0, 3).join("；")}。`);
  }
  if (cautions.length) {
    thesis.push(`扣分或保留：${cautions.slice(0, 3).join("；")}。`);
  }
  thesis.push(hasTranscript
    ? "可信度：已取得語音轉錄，能看到管理層在簡報外的補充與 Q&A；但專有名詞與口述數字仍需以簡報或公告交叉確認。"
    : "可信度：尚缺語音轉錄，較難判斷管理層口氣、Q&A 細節與未寫在簡報中的展望。"
  );

  const watchItems = [];
  if (outlook.length) watchItems.push("下一次更新優先比對本次展望是否落實為營收、毛利率或接單成長。 ");
  if (financial.length) watchItems.push("追蹤財務數字是否只是單季改善，或能延續成全年趨勢。 ");
  if (cautions.length) watchItems.push("留意保守訊號是否擴大，例如成本、需求遞延、區域調整或公司未量化的部分。 ");
  watchItems.push("此評分是法說內容品質與展望強弱的閱讀輔助，不等同買賣建議。 ");

  const lines = [
    `## ${row.code} ${row.name} 深度法說分析`,
    "",
    ...sectionLines("一頁結論", conclusion, "尚未形成足夠結論。"),
    ...sectionLines("營運與財務重點", financial.length ? financial : summary.slice(0, 6), "尚未擷取到明確財務重點。"),
    ...sectionLines("展望與成長利基", outlook.length ? outlook : business, "尚未擷取到明確展望段落。"),
    ...sectionLines("產品、客戶與市場位置", business, "尚未擷取到足夠的產品或市場資訊。"),
    ...sectionLines("風險與不確定性", cautions, "本次摘要未擷取到明確風險或保守訊號。"),
    ...sectionLines("Q&A 與管理層口氣", qna, "本次摘要未擷取到明確 Q&A 或管理層口氣補充。"),
    ...sectionLines("評分利基點", thesis, "目前分數主要來自一般展望訊號，尚缺更具體的量化佐證。"),
    ...sectionLines("後續追蹤清單", watchItems, "尚無特定追蹤事項。"),
  ];
  return lines.join("\n").trim();
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
    const resolvedSummaryBullets = summaryBullets.length ? summaryBullets : firstNarrativeBullets(block);
    const financialBullets = parseBullets(sectionAfter(block, "營運與財務"));
    const riskBullets = parseBullets(sectionAfter(block, "風險與不確定性"));
    const qnaBullets = parseBullets(sectionAfter(block, "Q&A / 其他"));
    const crossCheckBullets = parseBullets(sectionAfter(block, "交叉核對註記"));
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
      outlookTone: evaluateOutlookTone(outlookBullets, resolvedSummaryBullets),
      summaryBullets: resolvedSummaryBullets,
      financialBullets,
      riskBullets,
      qnaBullets,
      crossCheckBullets,
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

