import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "web", "data", "daily-briefing.js");
const performancePath = path.join(root, "web", "data", "performance-snapshot.js");

const watchlist = [
  ["AAPL", "Apple"],
  ["MSFT", "Microsoft"],
  ["NVDA", "NVIDIA"],
  ["AMZN", "Amazon"],
  ["GOOGL", "Alphabet"],
  ["META", "Meta Platforms"],
  ["TSLA", "Tesla"],
  ["AVGO", "Broadcom"],
  ["AMD", "Advanced Micro Devices"],
  ["ORCL", "Oracle"],
  ["TSM", "Taiwan Semiconductor Manufacturing Company"],
  ["INTC", "Intel"],
  ["AMAT", "Applied Materials"],
  ["LRCX", "Lam Research"],
  ["KLAC", "KLA Corporation"],
  ["ANET", "Arista Networks"],
  ["CSCO", "Cisco Systems"],
  ["MRVL", "Marvell Technology"],
  ["COHR", "Coherent Corp."],
  ["LITE", "Lumentum Holdings"],
  ["VRT", "Vertiv Holdings"],
  ["ETN", "Eaton Corporation"],
  ["PWR", "Quanta Services"],
  ["CRM", "Salesforce"],
  ["NOW", "ServiceNow"],
];

const cikByTicker = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  NVDA: "0001045810",
  AMZN: "0001018724",
  GOOGL: "0001652044",
  META: "0001326801",
  TSLA: "0001318605",
  AVGO: "0001730168",
  AMD: "0000002488",
  ORCL: "0001341439",
  TSM: "0001046179",
  INTC: "0000050863",
  AMAT: "0000006951",
  LRCX: "0000707549",
  KLAC: "0000319201",
  ANET: "0001596532",
  CSCO: "0000858877",
  MRVL: "0001835632",
  COHR: "0000820318",
  LITE: "0001633978",
  VRT: "0001674101",
  ETN: "0001551182",
  PWR: "0001050915",
  CRM: "0001108524",
  NOW: "0001373715",
};

const importantForms = new Set([
  "8-K",
  "10-Q",
  "10-K",
  "6-K",
  "20-F",
  "DEF 14A",
  "DEFA14A",
  "SC 13G",
  "SC 13G/A",
  "SC 13D",
  "SC 13D/A",
]);

const secHeaders = {
  "User-Agent": process.env.SEC_USER_AGENT ?? "Solurn us-ai-monitor/0.1 contact Solurn@users.noreply.github.com",
  Accept: "application/json,text/plain,*/*",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function secDocumentUrl(cik, accessionNumber, primaryDocument) {
  const cikNumber = String(Number(cik));
  const accession = String(accessionNumber).replaceAll("-", "");
  return `https://www.sec.gov/Archives/edgar/data/${cikNumber}/${accession}/${primaryDocument}`;
}

function formReadingPoints(form, items = "") {
  if (form === "8-K") {
    return [
      items ? `先看 8-K item 編號：${items}，判斷是財報、管理層異動、合約、增資或其他重大事項。` : "先確認 8-K item 編號，判斷公告屬於財報、管理層異動、合約、增資或其他重大事項。",
      "若附上 earnings release、investor presentation 或 transcript，優先看 guidance、capex、margin 與 management commentary。",
      "把內容和個股卡片中的研究問題對照，確認是否改變原本的投資假設。",
    ];
  }
  if (form === "10-Q" || form === "10-K" || form === "20-F") {
    return [
      "優先看 revenue growth、gross margin、operating margin、capex、cash flow 與 backlog/RPO 等可量化指標。",
      "讀 MD&A 時留意 management 對需求、供應鏈、價格、地緣風險與 AI 投資節奏的說法。",
      "風險因子若新增或語氣變重，代表公司正在提示市場尚未完全反映的壓力。",
    ];
  }
  if (form === "6-K") {
    return [
      "6-K 是外國發行人常用公告，可能包含財報、營運更新、公司簡報或重大新聞稿。",
      "先確認附件內容與日期，再判斷是否影響近期事件日曆或個股展望。",
    ];
  }
  if (form.includes("13")) {
    return [
      "13D/13G 類 filing 通常和大股東持股變化有關，可用來觀察機構或策略投資人的部位變化。",
      "這類資料不等於營運基本面改善，但可能影響籌碼與市場解讀。",
    ];
  }
  return [
    "先讀 filing 摘要與附件，再確認是否改變近期展望、事件日曆或研究問題。",
    "若公告涉及財務、產品、法說或資本市場活動，建議加入個股追蹤筆記。",
  ];
}

function filingToEvent({ ticker, company, cik, filing }) {
  const sourceUrl = secDocumentUrl(cik, filing.accessionNumber, filing.primaryDocument);
  return {
    date: filing.filingDate,
    time: "SEC",
    tickers: [ticker],
    title: `${ticker} ${filing.form} 官方公告`,
    category: "SEC 公告",
    confidence: "自動抓取",
    announcementSummary: `${company} 於 ${filing.filingDate} 申報 ${filing.form}${filing.reportDate ? `，report date 為 ${filing.reportDate}` : ""}。這是每日自動抓取的 SEC 官方 filing，尚未經人工或 AI 深度改寫；若是財報、8-K 或 6-K，建議點來源查看附件與管理層文字。`,
    readingPoints: formReadingPoints(filing.form, filing.items),
    source: `SEC EDGAR ${filing.form}`,
    sourceUrl,
  };
}

function decodeHtml(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function tagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function parseYahooRss(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1];
      const pubDate = tagValue(item, "pubDate");
      const date = pubDate ? new Date(pubDate) : null;
      return {
        title: tagValue(item, "title"),
        link: tagValue(item, "link"),
        pubDate,
        dateIso: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
      };
    })
    .filter((item) => item.title && item.link);
}

async function collectYahooNews() {
  const sinceIso = daysAgoIso(7);
  const stockUpdates = {};
  const errors = [];
  let itemCount = 0;

  for (const [ticker] of watchlist) {
    try {
      const response = await fetch(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`, {
        headers: { "User-Agent": "Mozilla/5.0 us-ai-monitor" },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const items = parseYahooRss(await response.text())
        .filter((item) => !item.dateIso || item.dateIso >= sinceIso)
        .slice(0, 3);
      if (!items.length) continue;

      itemCount += items.length;
      stockUpdates[ticker] = {
        items: items.map((item) => `${item.dateIso || "近期"} Yahoo Finance：${item.title}`),
        sources: items.map((item) => ({
          label: `Yahoo ${item.dateIso || "news"}`,
          url: item.link,
        })),
      };
    } catch (error) {
      errors.push(`${ticker}: Yahoo RSS ${error.message}`);
    }
  }

  return { stockUpdates, errors, itemCount };
}

function extractRecentFilings(submissions, sinceIso) {
  const recent = submissions?.filings?.recent;
  if (!recent?.form?.length) return [];
  return recent.form
    .map((form, index) => ({
      form,
      filingDate: recent.filingDate[index],
      reportDate: recent.reportDate[index] ?? "",
      accessionNumber: recent.accessionNumber[index],
      primaryDocument: recent.primaryDocument[index],
      items: recent.items?.[index] ?? "",
    }))
    .filter((filing) => filing.filingDate >= sinceIso && importantForms.has(filing.form))
    .slice(0, 6);
}

async function collectSecUpdates() {
  const sinceIso = daysAgoIso(14);
  const events = [];
  const stockUpdates = {};
  const errors = [];

  for (const [ticker, company] of watchlist) {
    const cik = cikByTicker[ticker];
    if (!cik) {
      errors.push(`${ticker}: CIK not found`);
      continue;
    }
    try {
      const submissions = await fetchJson(`https://data.sec.gov/submissions/CIK${cik}.json`, secHeaders);
      const filings = extractRecentFilings(submissions, sinceIso);
      if (!filings.length) continue;

      stockUpdates[ticker] = {
        items: filings.map((filing) => {
          const itemText = filing.items ? `；items: ${filing.items}` : "";
          return `${filing.filingDate} SEC ${filing.form}${itemText}。請優先檢查附件、財務表格與 management commentary。`;
        }),
        sources: filings.slice(0, 3).map((filing) => ({
          label: `SEC ${filing.form} ${filing.filingDate}`,
          url: secDocumentUrl(cik, filing.accessionNumber, filing.primaryDocument),
        })),
      };

      filings.slice(0, 2).forEach((filing) => {
        events.push(filingToEvent({ ticker, company, cik, filing }));
      });
    } catch (error) {
      errors.push(`${ticker}: ${error.message}`);
    }
  }

  return { events, stockUpdates, errors };
}

async function loadPerformanceSnapshot() {
  try {
    const code = await fs.readFile(performancePath, "utf8");
    const sandbox = { window: {} };
    vm.runInNewContext(code, sandbox);
    return sandbox.window.marketPerformanceSnapshot ?? null;
  } catch {
    return null;
  }
}

function performanceHeadlines(snapshot) {
  const items = snapshot?.items ?? {};
  const rows = Object.entries(items)
    .filter(([key, value]) => key.startsWith("US:") && typeof value?.pct === "number")
    .map(([key, value]) => ({ ticker: key.replace("US:", ""), ...value }))
    .sort((a, b) => b.pct - a.pct);

  if (!rows.length) return [];
  const strongest = rows.slice(0, 4).map((item) => `${item.ticker} ${item.pct > 0 ? "+" : ""}${item.pct.toFixed(1)}%`).join("、");
  const weakest = rows.slice(-4).reverse().map((item) => `${item.ticker} ${item.pct > 0 ? "+" : ""}${item.pct.toFixed(1)}%`).join("、");
  const asOf = rows[0]?.asOf ? `（截至 ${rows[0].asOf}）` : "";
  return [
    `近 21 個交易日較強標的：${strongest}${asOf}。`,
    `近 21 個交易日較弱標的：${weakest}${asOf}。`,
  ];
}

function buildFallbackHeadline(secCount, errorCount) {
  if (secCount > 0) return `今日自動抓取到 ${secCount} 筆近 14 天 SEC 重要 filing，已併入事件日曆與個股卡片。`;
  if (errorCount > 0) return "今日 SEC 端點未完整連線成功；網頁會保留既有研究筆記，並使用新聞 RSS 與漲跌幅 snapshot 補上每日追蹤線索。";
  return "今日未抓到近 14 天新的重要 SEC filing，請以既有事件日曆、財報日期與個股卡片作為追蹤主軸。";
}

function mergeStockUpdates(...groups) {
  const merged = {};
  groups.forEach((group) => {
    Object.entries(group ?? {}).forEach(([ticker, update]) => {
      if (!merged[ticker]) merged[ticker] = { items: [], sources: [] };
      merged[ticker].items.push(...(update.items ?? []));
      merged[ticker].sources.push(...(update.sources ?? []));
    });
  });
  return merged;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const performance = await loadPerformanceSnapshot();
  let secResult = { events: [], stockUpdates: {}, errors: [] };
  let yahooResult = { stockUpdates: {}, errors: [], itemCount: 0 };

  try {
    secResult = await collectSecUpdates();
  } catch (error) {
    secResult.errors.push(`SEC collection failed: ${error.message}`);
  }

  try {
    yahooResult = await collectYahooNews();
  } catch (error) {
    yahooResult.errors.push(`Yahoo RSS collection failed: ${error.message}`);
  }

  const stockUpdates = mergeStockUpdates(secResult.stockUpdates, yahooResult.stockUpdates);
  const performanceLines = performanceHeadlines(performance);
  const payload = {
    generatedAt,
    asOfDate: todayIso(),
    sourceMode: "GitHub Actions / public sources",
    summary: [
      buildFallbackHeadline(secResult.events.length, secResult.errors.length),
      yahooResult.itemCount > 0
        ? `今日自動抓取到 ${yahooResult.itemCount} 則 Yahoo Finance 近期新聞標題，已併入相關個股卡片作為研究線索。`
        : "今日 Yahoo Finance RSS 未提供新的近期新聞標題，個股卡片會保留既有研究筆記。",
      ...performanceLines,
      "目前版本會自動整理公開 filing 嘗試結果、Yahoo Finance 新聞標題與美股 21 交易日漲跌幅；法說逐字稿、券商評等與 AI 改寫可在下一階段接入。",
    ],
    events: secResult.events.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    stockUpdates,
    stats: {
      secEvents: secResult.events.length,
      newsItems: yahooResult.itemCount,
      updatedStocks: Object.keys(stockUpdates).length,
      errors: secResult.errors.length + yahooResult.errors.length,
      performanceAsOf: performance?.asOf ?? "",
    },
    errors: [...secResult.errors, ...yahooResult.errors].slice(0, 12),
  };

  const banner = "// Auto-generated by scripts/update-daily-briefing.mjs. Do not edit by hand.\n";
  await fs.writeFile(outputPath, `${banner}window.dailyBriefing = ${JSON.stringify(payload, null, 2)};\n`, "utf8");

  console.log(`Updated ${path.relative(root, outputPath)}`);
  console.log(`SEC events: ${payload.stats.secEvents}, news items: ${payload.stats.newsItems}, stocks updated: ${payload.stats.updatedStocks}, errors: ${payload.stats.errors}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
