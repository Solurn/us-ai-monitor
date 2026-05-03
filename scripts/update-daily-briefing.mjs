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

function taipeiTodayIso(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addBusinessDays(dateIso, businessDays) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  let added = 0;
  while (added < businessDays) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date.toISOString().slice(0, 10);
}

function shiftDateIso(dateIso, days) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const announcedEventCatalog = [
  {
    date: "2026-04-30",
    time: "02:00",
    tickers: ["MACRO"],
    matchTitle: "FOMC",
    title: "FOMC 利率決議與政策聲明已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Fed 維持聯邦基金利率目標區間在 3.50%-3.75%，但聲明承認通膨仍偏高且中東局勢使前景不確定性升高。投票結果不算乾淨：Miran 主張降息 1 碼，Hammack、Kashkari、Logan 支持不降息但反對聲明中的寬鬆傾向。",
    metrics: [
      "利率：3.50%-3.75%，本次不變。",
      "經濟語氣：活動穩健擴張、就業增幅偏低、失業率近月變化不大。",
      "通膨語氣：仍偏高，部分反映全球能源價格上升。",
      "投票：8 票支持；4 票反對或不同意聲明語氣。",
    ],
    researchRead:
      "對高估值成長股來說，重點不是這次有沒有降息，而是 Fed 是否願意給市場明確降息路徑；這份聲明偏保守，AI/雲端 capex 題材仍要留意長端利率與能源價格。",
    source: "Federal Reserve FOMC statement",
    sourceUrl: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20260429a.htm",
  },
  {
    date: "2026-04-30",
    time: "04:30",
    tickers: ["GOOGL"],
    matchTitle: "Alphabet",
    title: "Alphabet Q1 2026 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Alphabet Q1 明顯優於市場預期，營收 109.9B 美元、年增 22%，EPS 5.11 美元；最大亮點是 Google Cloud 營收 20.03B、年增 63%，backlog 接近翻倍到 460B 美元以上。",
    metrics: [
      "營收：109.9B 美元，年增 22%。",
      "EPS：5.11 美元；淨利 62.58B 美元，含股權投資評價利益影響。",
      "Google Cloud：20.03B 美元，年增 63%。",
      "Search：AI experiences 帶動 queries 創高，Search revenue 年增 19%。",
    ],
    researchRead:
      "這份結果把 Alphabet 從單純 Search 防守戰，拉回 AI cloud / TPU / Gemini 生態系成長故事；後續要追的是 Cloud backlog 轉收入速度、capex 是否繼續上修，以及 AI Search 對廣告毛利的影響。",
    source: "Alphabet 8-K summary / 9to5Google",
    sourceUrl: "https://www.stocktitan.net/sec-filings/GOOG/8-k-alphabet-inc-reports-material-event-99e4ee982355.html",
    reactionDate: "2026-04-29",
  },
  {
    date: "2026-04-30",
    time: "05:00",
    tickers: ["KLAC"],
    matchTitle: "KLA",
    title: "KLA FY2026 Q3 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "KLA FY2026 Q3 營收與 EPS 均高於 guidance midpoint，並加碼股東回饋。管理層強調 AI infrastructure buildout 對 foundry/logic、memory、advanced packaging 與 services 都有結構性支撐。",
    metrics: [
      "營收：3.415B 美元，高於 3.35B +/- 150M guidance midpoint。",
      "GAAP EPS：9.12 美元；non-GAAP EPS：9.40 美元。",
      "營運現金流：707.5M 美元；自由現金流：622.3M 美元。",
      "資本回饋：季度股利提高至 2.30 美元，新增 7B 美元庫藏股授權。",
    ],
    researchRead:
      "KLA 的重點是 AI/HBM/先進封裝會提高良率與 process control 的重要性；若 KLA 對 2026 WFE 與 advanced packaging 持續樂觀，AMAT/LRCX/KLAC 這組設備股評價支撐會更強。",
    source: "KLA fiscal 2026 Q3 results",
    sourceUrl: "https://ir.kla.com/news-events/press-releases/detail/514/kla-corporation-reports-fiscal-2026-third-quarter-results",
    reactionDate: "2026-04-29",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["MSFT"],
    matchTitle: "Microsoft",
    title: "Microsoft FY26 Q3 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Microsoft FY26 Q3 營收、營業利益、淨利與 EPS 都年增雙位數；Microsoft Cloud 營收 54.5B、年增 29%，Azure 與其他雲服務年增 40%，AI business 年化收入 run rate 超過 37B 美元。",
    metrics: [
      "營收：82.9B 美元，年增 18%。",
      "營業利益：38.4B 美元，年增 20%；淨利 31.8B 美元，年增 23%。",
      "EPS：4.27 美元，年增 23%。",
      "Azure and other cloud services：年增 40%；commercial RPO 增至 627B 美元，年增 99%。",
    ],
    researchRead:
      "Microsoft 的結果支持 AI cloud demand 仍強，但投資人會繼續問 capex、OpenAI exposure 與 Copilot 變現速度；若 Azure 仍受供給限制，短期 capex 壓力比較容易被市場接受。",
    source: "Microsoft FY26 Q3 earnings release",
    sourceUrl: "https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q3/press-release-webcast",
    reactionDate: "2026-04-29",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["AMZN"],
    matchTitle: "Amazon",
    title: "Amazon Q1 2026 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Amazon Q1 營收 181.5B 美元、年增 17%，營業利益 23.9B 美元；AWS 營收 37.6B、年增 28%，AWS 營業利益 14.2B。淨利與 EPS 受 Anthropic 投資未實現利益推升。",
    metrics: [
      "淨銷售：181.5B 美元，年增 17%；排除匯率影響年增 15%。",
      "AWS：37.6B 美元，年增 28%；AWS operating income 14.2B 美元。",
      "營業利益：23.9B 美元；淨利 30.3B 美元，EPS 2.78 美元。",
      "自由現金流：TTM 降至 1.2B 美元，主要因 AI 相關 property and equipment 投資增加。",
    ],
    researchRead:
      "Amazon 的亮點是 AWS 加速與獲利能力強，但 AI capex 對 FCF 壓力也同步放大；後續要追 AWS growth 是否能持續高於 capex 增速。",
    source: "Amazon Q1 2026 results",
    sourceUrl: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-First-Quarter-Results/default.aspx",
    reactionDate: "2026-04-29",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["META"],
    matchTitle: "Meta",
    title: "Meta Q1 2026 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Meta Q1 營收 56.31B 美元、年增 33%，EPS 10.44 美元；廣告 impression 與 ad price 同步成長。不過公司將 2026 capex outlook 上調到 125B-145B 美元，市場焦點會轉向 AI 投資回收期。",
    metrics: [
      "營收：56.31B 美元，年增 33%；operating margin 41%。",
      "EPS：10.44 美元；若排除 8.03B 稅務利益，EPS 低 3.13 美元。",
      "Family DAP：3.56B，年增 4%；ad impressions 年增 19%，average price per ad 年增 12%。",
      "2026 capex guidance：125B-145B 美元，高於先前 115B-135B 美元。",
    ],
    researchRead:
      "Meta 的廣告本業非常強，但股價反應可能取決於市場是否接受更高 AI capex；要看管理層能否把 AI spending 連回 ad targeting、ranking、business messaging 與個人 AI agents 的收入路徑。",
    source: "Meta Q1 2026 results",
    sourceUrl: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-First-Quarter-2026-Results/default.aspx",
    reactionDate: "2026-04-29",
  },
  {
    date: "2026-04-30",
    time: "20:30",
    tickers: ["MACRO"],
    matchTitle: "GDP",
    title: "美國 Q1 GDP advance estimate 已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "BEA 公布 2026 Q1 real GDP advance estimate 年化成長 2.0%，較 2025 Q4 的 0.5% 明顯加速。成長主要來自投資、出口、消費與政府支出，但進口也增加並抵銷部分 GDP。",
    metrics: [
      "Real GDP：Q1 2026 年化 +2.0%，Q4 2025 為 +0.5%。",
      "Real final sales to private domestic purchasers：+2.5%，高於前季 +1.8%。",
      "加速來源：政府支出與出口轉正、投資加速。",
      "抵銷項：消費支出減速，進口轉增。",
    ],
    researchRead:
      "這份 GDP 不是衰退訊號，反而顯示 AI/企業投資與政府支出支撐需求；但若同時搭配 ECI、ISM prices 偏熱，市場會擔心 Fed 降息空間變小。",
    source: "BEA GDP advance estimate",
    sourceUrl: "https://www.bea.gov/news/2026/gdp-advance-estimate-1st-quarter-2026",
  },
  {
    date: "2026-04-30",
    time: "20:30",
    tickers: ["MACRO"],
    matchTitle: "Employment Cost",
    title: "Employment Cost Index Q1 2026 已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "BLS 公布 2026 Q1 Employment Cost Index：civilian workers compensation costs 季增 0.9%，其中 wages and salaries +0.8%、benefits +1.2%；年增 3.4%。",
    metrics: [
      "Compensation costs：季增 +0.9%。",
      "Wages and salaries：季增 +0.8%。",
      "Benefit costs：季增 +1.2%。",
      "12 個月變化：compensation +3.4%、wages +3.4%、benefits +3.6%。",
    ],
    researchRead:
      "ECI 對 Fed 很重要，因為它比一般平均時薪更能反映雇主成本。這次不是失控，但 wage/benefit 成本仍偏黏，對長端利率與高估值成長股不算完全友善。",
    source: "BLS Employment Cost Index",
    sourceUrl: "https://www.bls.gov/news.release/eci.nr0.htm",
  },
  {
    date: "2026-04-30",
    time: "21:00",
    tickers: ["PWR"],
    matchTitle: "Quanta",
    title: "Quanta Services Q1 2026 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Quanta Services Q1 創多項季度紀錄，營收 7.87B 美元、adjusted EPS 2.68 美元，RPO 26.2B、total backlog 48.5B 美元，並大幅上修 2026 年財測。",
    metrics: [
      "營收：7.87B 美元，年增約 26%。",
      "GAAP diluted EPS：1.45 美元；adjusted diluted EPS：2.68 美元。",
      "Adjusted EBITDA：686.4M 美元。",
      "RPO：26.2B 美元；total backlog：48.5B 美元。",
    ],
    researchRead:
      "PWR 的結果直接支持 data center power、utility grid、electric infrastructure 這條主線。若 backlog 與上修財測延續，VRT/ETN/PWR 這組 AI 電力基建股的敘事會更穩。",
    source: "Quanta Services Q1 2026 results",
    sourceUrl: "https://investors.quantaservices.com/news-events/press-releases/detail/396/quanta-services-reports-first-quarter-2026-results",
    reactionDate: "2026-04-30",
  },
  {
    date: "2026-05-01",
    time: "05:00",
    tickers: ["AAPL"],
    matchTitle: "Apple",
    title: "Apple Q2 FY2026 結果已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "Apple FY2026 Q2 創 March quarter 紀錄，營收 111.2B 美元、年增 17%，EPS 2.01 美元、年增 22%；iPhone、總營收與 EPS 都創三月季度紀錄，Services 也再創新高。",
    metrics: [
      "營收：111.2B 美元，年增 17%。",
      "淨利：29.6B 美元；diluted EPS：2.01 美元，年增 22%。",
      "Gross margin：49.3%。",
      "股東回饋：新增 100B 美元回購授權，季度股利提高至 0.27 美元。",
    ],
    researchRead:
      "AAPL 這次不是單純防守型財報，iPhone 17 demand 與 Services record 是多頭重點；但 AI roadmap、記憶體成本與 advanced node supply 仍是下一階段估值能否擴張的關鍵。",
    source: "Apple 8-K exhibit / Apple newsroom",
    sourceUrl: "https://www.sec.gov/Archives/edgar/data/320193/000032019326000011/a8-kex991q2202603282026.htm",
    reactionDate: "2026-04-30",
  },
  {
    date: "2026-05-01",
    time: "22:00",
    tickers: ["MACRO"],
    matchTitle: "ISM Manufacturing",
    title: "ISM Manufacturing PMI 已公布",
    type: "已公告結果",
    priority: "高",
    summary:
      "ISM April Manufacturing PMI 維持 52.7，連續第 4 個月擴張；新訂單升至 54.1，但 employment 降至 46.4，prices 升至 84.6，顯示製造業需求穩、價格壓力更熱。",
    metrics: [
      "Manufacturing PMI：52.7，與 3 月持平。",
      "New Orders：54.1，較 3 月 53.5 上升。",
      "Production：53.4，仍擴張但較 3 月 55.1 放慢。",
      "Employment：46.4，連續收縮；Prices：84.6，創 2022 年 4 月以來最高。",
    ],
    researchRead:
      "這份 ISM 對 AI/工業供應鏈偏正面，因電腦電子、機械等類別仍擴張；但 prices 太熱，會強化通膨黏性與利率壓力。",
    source: "ISM April 2026 Manufacturing PMI",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/april/",
  },
];

function activeAnnouncedEvents(asOfDate) {
  return announcedEventCatalog
    .map((event) => ({
      ...event,
      retainUntil: addBusinessDays(event.date, 4),
    }))
    .filter((event) => asOfDate <= event.retainUntil);
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

function pctChange(current, base) {
  if (typeof current !== "number" || typeof base !== "number" || base === 0) return null;
  return ((current - base) / base) * 100;
}

function formatMarketTimestamp(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toISOString();
}

function easternEpoch(dateIso, time) {
  return Math.floor(Date.parse(`${dateIso}T${time}-04:00`) / 1000);
}

function yahooChartUrl(ticker, marketDate) {
  if (!marketDate) {
    return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1m&includePrePost=true`;
  }
  const period1 = easternEpoch(marketDate, "04:00:00");
  const period2 = easternEpoch(marketDate, "20:30:00");
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${period1}&period2=${period2}&interval=1m&includePrePost=true`;
}

function parseYahooChartReaction(data, marketDate = "", dailyContext = {}) {
  const result = data?.chart?.result?.[0];
  const meta = result?.meta ?? {};
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const regularStart = marketDate ? easternEpoch(marketDate, "09:30:00") : meta.currentTradingPeriod?.regular?.start;
  const regularEnd = marketDate ? easternEpoch(marketDate, "16:00:00") : meta.currentTradingPeriod?.regular?.end;
  const rows = timestamps
    .map((timestamp, index) => ({ timestamp, close: closes[index] }))
    .filter((row) => typeof row.timestamp === "number" && typeof row.close === "number");
  const regularRows = rows.filter((row) => (!regularStart || row.timestamp >= regularStart) && (!regularEnd || row.timestamp <= regularEnd));
  const regularClose = regularRows.at(-1)?.close ?? (typeof meta.regularMarketPrice === "number" ? meta.regularMarketPrice : null);
  const previousClose = typeof dailyContext.previousClose === "number"
    ? dailyContext.previousClose
    : typeof meta.chartPreviousClose === "number"
    ? meta.chartPreviousClose
    : typeof meta.previousClose === "number"
      ? meta.previousClose
      : null;
  const postRows = rows.filter((row) => !regularEnd || row.timestamp > regularEnd);
  const latestPost = postRows.at(-1);
  const afterHoursPrice = latestPost?.close ?? null;
  return {
    ticker: meta.symbol ?? "",
    close: regularClose,
    closeChangePct: pctChange(regularClose, previousClose),
    previousClose,
    afterHoursPrice,
    afterHoursChangePct: pctChange(afterHoursPrice, regularClose),
    reactionDate: marketDate,
    asOf: formatMarketTimestamp(latestPost?.timestamp ?? regularRows.at(-1)?.timestamp ?? meta.regularMarketTime),
    provider: "Yahoo Finance chart",
  };
}

async function fetchDailyCloseContext(ticker, marketDate) {
  if (!marketDate) return {};
  const start = Math.floor(Date.parse(`${shiftDateIso(marketDate, -10)}T00:00:00Z`) / 1000);
  const end = Math.floor(Date.parse(`${shiftDateIso(marketDate, 2)}T00:00:00Z`) / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${start}&period2=${end}&interval=1d`;
  const data = await fetchJson(url, { "User-Agent": "Mozilla/5.0 us-ai-monitor" });
  const result = data?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const rows = timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: closes[index],
    }))
    .filter((row) => typeof row.close === "number");
  const marketIndex = rows.findIndex((row) => row.date === marketDate);
  if (marketIndex <= 0) return {};
  return {
    previousClose: rows[marketIndex - 1].close,
    dailyClose: rows[marketIndex].close,
  };
}

async function fetchMarketReaction(ticker, marketDate = "") {
  const url = yahooChartUrl(ticker, marketDate);
  const [data, dailyContext] = await Promise.all([
    fetchJson(url, { "User-Agent": "Mozilla/5.0 us-ai-monitor" }),
    fetchDailyCloseContext(ticker, marketDate),
  ]);
  return parseYahooChartReaction(data, marketDate, dailyContext);
}

async function enrichEventOutcomesWithMarketReaction(outcomes) {
  return Promise.all(outcomes.map(async (outcome) => {
    const stockTickers = (outcome.tickers ?? []).filter((ticker) => ticker !== "MACRO");
    if (!stockTickers.length) return outcome;
    const marketReaction = [];
    for (const ticker of stockTickers) {
      try {
        marketReaction.push(await fetchMarketReaction(ticker, outcome.reactionDate));
      } catch (error) {
        marketReaction.push({
          ticker,
          close: null,
          closeChangePct: null,
          previousClose: null,
          afterHoursPrice: null,
          afterHoursChangePct: null,
          reactionDate: outcome.reactionDate ?? "",
          asOf: "",
          provider: "Yahoo Finance chart",
          error: error.message,
        });
      }
    }
    return { ...outcome, marketReaction };
  }));
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

const newsKeywordWeights = [
  [/earnings|results|revenue|profit|margin|guidance|forecast|outlook/i, 9],
  [/upgrade|downgrade|price target|buy rating|sell rating|strong buy|analyst/i, 8],
  [/OpenAI|Anthropic|Gemini|\bAI\b|artificial intelligence|data center|datacenter|cloud|capex|GPU|chip/i, 7],
  [/acquisition|deal|partnership|exclusive|blocks|blocked|regulator|antitrust|China/i, 6],
  [/\bFed\b|\bCPI\b|\bPPI\b|jobs report|\bpayroll\b|\bemployment report\b|\bjobless\b|\binflation\b|\brates?\b|\byields?\b|oil shock/i, 5],
  [/rally|surge|jumps|slides|falls|drops|soars|plunges|washout/i, 4],
];

function companyTokens(company) {
  return company
    .replace(/\b(Inc|Corp|Corporation|Company|Holdings|Technology|Technologies|Systems|Services|Platforms)\b\.?/gi, "")
    .split(/\s+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length >= 4);
}

const companyTokenMap = Object.fromEntries(watchlist.map(([ticker, company]) => [ticker, companyTokens(company)]));

const tickerAliases = {
  AAPL: ["apple", "iphone"],
  MSFT: ["microsoft", "openai", "azure"],
  NVDA: ["nvidia"],
  AMZN: ["amazon", "aws"],
  GOOGL: ["alphabet", "google", "gemini"],
  META: ["meta", "facebook", "instagram"],
  TSLA: ["tesla"],
  AVGO: ["broadcom", "vmware"],
  AMD: ["amd", "advanced micro"],
  ORCL: ["oracle"],
  TSM: ["tsmc", "taiwan semiconductor"],
  INTC: ["intel"],
  AMAT: ["applied materials"],
  LRCX: ["lam research"],
  KLAC: ["kla"],
  ANET: ["arista"],
  CSCO: ["cisco"],
  MRVL: ["marvell"],
  COHR: ["coherent"],
  LITE: ["lumentum"],
  VRT: ["vertiv"],
  ETN: ["eaton"],
  PWR: ["quanta services"],
  CRM: ["salesforce"],
  NOW: ["servicenow", "service now"],
};

function explicitlyMentionsTicker(title, ticker) {
  const upper = title.toUpperCase();
  const lower = title.toLowerCase();
  if (new RegExp(`(^|[^A-Z0-9])${ticker}([^A-Z0-9]|$)`).test(upper)) return true;
  if ((companyTokenMap[ticker] ?? []).some((token) => lower.includes(token))) return true;
  return (tickerAliases[ticker] ?? []).some((alias) => lower.includes(alias));
}

function mentionedTickers(title) {
  return watchlist
    .map(([ticker]) => ticker)
    .filter((ticker) => explicitlyMentionsTicker(title, ticker));
}

function scoreNewsTitle(title, ticker) {
  const upper = title.toUpperCase();
  const lower = title.toLowerCase();
  let score = new RegExp(`(^|[^A-Z0-9])${ticker}([^A-Z0-9]|$)`).test(upper) ? 10 : 0;
  if ((companyTokenMap[ticker] ?? []).some((token) => lower.includes(token))) score += 8;
  newsKeywordWeights.forEach(([pattern, weight]) => {
    if (pattern.test(title)) score += weight;
  });
  return score;
}

function newsType(title) {
  if (/upgrade|downgrade|price target|buy rating|sell rating|strong buy|analyst/i.test(title)) return "評等 / 目標價";
  if (/earnings|results|revenue|profit|margin|guidance|forecast|outlook/i.test(title)) return "財報 / 展望";
  if (/OpenAI|Anthropic|Gemini|\bAI\b|artificial intelligence|data center|datacenter|cloud|capex|GPU|chip/i.test(title)) return "AI / 產業";
  if (/acquisition|deal|partnership|exclusive|blocks|blocked|regulator|antitrust|China/i.test(title)) return "交易 / 監管";
  if (/\bFed\b|\bCPI\b|\bPPI\b|jobs report|\bpayroll\b|\bemployment report\b|\bjobless\b|\binflation\b|\brates?\b|\byields?\b|oil shock/i.test(title)) return "總經 / 利率";
  return "新聞線索";
}

function highlightWhy(type, tickers) {
  const tickerText = tickers.length ? tickers.join("、") : "相關標的";
  if (type === "評等 / 目標價") return `和 ${tickerText} 的市場預期或機構態度有關，適合優先確認是否出現多家同步調整。`;
  if (type === "財報 / 展望") return `可能影響 ${tickerText} 的營收、毛利、guidance 或估值假設，建議優先閱讀原文重點。`;
  if (type === "AI / 產業") return `會牽動 AI infrastructure、cloud capex 或供應鏈敘事，可對照個股卡片與延伸學習主題。`;
  if (type === "交易 / 監管") return `可能改變競爭格局、合作關係或地緣風險，需留意是否影響後續展望。`;
  if (type === "總經 / 利率") return `會影響成長股估值、capex 風險偏好與短線資金流向。`;
  return `這是今天新增的公開新聞線索，可作為 ${tickerText} 的追蹤入口。`;
}

function chineseTakeaway(title, tickers) {
  const type = newsType(title);
  const tickerText = tickers.length ? tickers.join("、") : "相關標的";
  const lower = title.toLowerCase();
  const notes = [];

  if (/rebound|rebounds|rally|surge|jumps|soars|record high|big winners/i.test(title)) notes.push("股價或市場情緒偏強");
  if (/slides|falls|drops|plunges|worst performer|washout|loser/i.test(title)) notes.push("市場情緒或股價表現偏弱");
  if (/earnings|results|revenue|profit|margin|guidance|forecast|outlook/i.test(title)) notes.push("重點看財報、營收、毛利與展望");
  if (/upgrade|downgrade|price target|buy rating|sell rating|strong buy|analyst/i.test(title)) notes.push("留意分析師評等或目標價是否改變");
  if (/options/i.test(title)) notes.push("選擇權市場可能在定價較大的財報波動");
  if (/OpenAI|Anthropic|Gemini|\bAI\b|artificial intelligence|data center|datacenter|cloud|capex|GPU|chip/i.test(title)) notes.push("和 AI、雲端、資料中心或晶片投資有關");
  if (/partnership|deal|acquisition|losing|lost|exclusive|blocks|blocked|regulator|antitrust/i.test(title)) notes.push("可能影響合作關係、訂單分配或競爭格局");
  if (/\bFed\b|\bCPI\b|\bPPI\b|jobs report|\bpayroll\b|\bemployment report\b|\bjobless\b|\binflation\b|\brates?\b|\byields?\b|oil shock/i.test(title)) notes.push("可能影響利率預期與成長股估值");
  if (/valuation/i.test(title)) notes.push("市場正在重新討論估值是否合理");

  if (!notes.length) {
    if (type === "評等 / 目標價") notes.push("重點看機構態度是否轉強或轉弱");
    else if (type === "財報 / 展望") notes.push("重點看財報與後續展望是否改變");
    else if (type === "AI / 產業") notes.push("重點看 AI 需求、capex 或供應鏈敘事是否有變");
    else if (type === "交易 / 監管") notes.push("重點看競爭格局或監管風險是否有變");
    else notes.push("這是一則新的公開新聞線索");
  }

  const prefix = type === "新聞線索" ? `${tickerText} 有新的市場新聞。` : `${tickerText} 出現 ${type} 相關新聞。`;
  const ending = lower.includes("nvidia") && tickers.includes("LITE")
    ? "特別可連到光通訊、資料中心 optics 與 NVIDIA 供應鏈題材。"
    : "建議點原文確認細節，再回到個股卡片更新研究假設。";

  return `${prefix}${notes.join("；")}。${ending}`;
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

function buildNewsHighlights(newsItems) {
  const grouped = new Map();
  newsItems.forEach((item) => {
    if (!explicitlyMentionsTicker(item.title, item.ticker)) return;
    const score = scoreNewsTitle(item.title, item.ticker);
    if (score < 8) return;
    const key = normalizeTitle(item.title);
    if (!grouped.has(key)) {
      grouped.set(key, {
        type: newsType(item.title),
        title: item.title,
        tickers: new Set(),
        score: 0,
        date: item.dateIso,
        sourceUrl: item.link,
      });
    }
    const existing = grouped.get(key);
    mentionedTickers(item.title).forEach((ticker) => existing.tickers.add(ticker));
    existing.score += score;
    if (item.dateIso > existing.date) existing.date = item.dateIso;
  });

  return [...grouped.values()]
    .map((item) => {
      const tickers = [...item.tickers].slice(0, 6);
      return {
        priority: item.score >= 25 ? "高" : "中",
        type: item.type,
        title: item.title,
        titleZh: chineseTakeaway(item.title, tickers),
        tickers,
        why: highlightWhy(item.type, tickers),
        source: "Yahoo Finance RSS",
        sourceUrl: item.sourceUrl,
        date: item.date,
      };
    })
    .sort((a, b) => (b.priority === "高") - (a.priority === "高") || b.tickers.length - a.tickers.length)
    .slice(0, 7);
}

async function collectYahooNews() {
  const sinceIso = daysAgoIso(7);
  const stockUpdates = {};
  const errors = [];
  const newsItems = [];
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
      items.forEach((item) => newsItems.push({ ...item, ticker }));
      stockUpdates[ticker] = {
        items: items.map((item) => {
          const tickers = mentionedTickers(item.title);
          const scopedTickers = tickers.length ? tickers : [ticker];
          return `${item.dateIso || "近期"} 中文導讀：${chineseTakeaway(item.title, scopedTickers)}（原標題：${item.title}）`;
        }),
        sources: items.map((item) => ({
          label: `Yahoo ${item.dateIso || "news"}`,
          url: item.link,
        })),
      };
    } catch (error) {
      errors.push(`${ticker}: Yahoo RSS ${error.message}`);
    }
  }

  return { stockUpdates, errors, itemCount, newsItems };
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

function performanceHighlights(snapshot) {
  const items = snapshot?.items ?? {};
  const rows = Object.entries(items)
    .filter(([key, value]) => key.startsWith("US:") && typeof value?.pct === "number")
    .map(([key, value]) => ({ ticker: key.replace("US:", ""), ...value }))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  return rows
    .filter((item) => Math.abs(item.pct) >= 8)
    .slice(0, 3)
    .map((item) => ({
      priority: Math.abs(item.pct) >= 20 ? "高" : "中",
      type: "股價異動",
      title: `${item.ticker} 近 21 個交易日 ${item.pct > 0 ? "上漲" : "下跌"} ${item.pct > 0 ? "+" : ""}${item.pct.toFixed(1)}%`,
      tickers: [item.ticker],
      why: `這是相對明顯的月線級別異動，建議回頭檢查是否和財報、AI 題材、評等調整或產業鏈消息有關。資料截至 ${item.asOf || "最近交易日"}。`,
      source: item.provider ?? "market performance snapshot",
      sourceUrl: "",
      date: item.asOf ?? "",
    }));
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
  const asOfDate = taipeiTodayIso();
  const eventOutcomes = await enrichEventOutcomesWithMarketReaction(activeAnnouncedEvents(asOfDate));
  const performance = await loadPerformanceSnapshot();
  let secResult = { events: [], stockUpdates: {}, errors: [] };
  let yahooResult = { stockUpdates: {}, errors: [], itemCount: 0, newsItems: [] };

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
  const highlights = [
    ...eventOutcomes.map((event) => ({
      priority: event.priority,
      type: event.type,
      title: event.title,
      tickers: event.tickers,
      why: event.summary,
      source: event.source,
      sourceUrl: event.sourceUrl,
      date: event.date,
    })),
    ...buildNewsHighlights(yahooResult.newsItems ?? []),
    ...performanceHighlights(performance),
    ...secResult.events.slice(0, 3).map((event) => ({
      priority: "高",
      type: "SEC 公告",
      title: event.title,
      tickers: event.tickers,
      why: event.announcementSummary,
      source: event.source,
      sourceUrl: event.sourceUrl,
      date: event.date,
    })),
  ].slice(0, 10);
  const payload = {
    generatedAt,
    asOfDate,
    sourceMode: "GitHub Actions / public sources",
    highlights,
    summary: [
      eventOutcomes.length > 0
        ? `已公告結果 ${eventOutcomes.length} 筆已接入事件卡片，會依 3 個工作天保留規則自動移除；例如 2026-04-30 公告會保留到 2026-05-06。`
        : "今日沒有仍在 3 個工作天保留期內的已公告事件結果。",
      buildFallbackHeadline(secResult.events.length, secResult.errors.length),
      yahooResult.itemCount > 0
        ? `今日自動抓取到 ${yahooResult.itemCount} 則 Yahoo Finance 近期新聞標題，已併入相關個股卡片作為研究線索。`
        : "今日 Yahoo Finance RSS 未提供新的近期新聞標題，個股卡片會保留既有研究筆記。",
      ...performanceLines,
      "目前版本會自動整理公開 filing 嘗試結果、Yahoo Finance 新聞標題與美股 21 交易日漲跌幅；法說逐字稿、券商評等與 AI 改寫可在下一階段接入。",
    ],
    events: secResult.events.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    eventOutcomes,
    stockUpdates,
    stats: {
      secEvents: secResult.events.length,
      eventOutcomes: eventOutcomes.length,
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
  console.log(`SEC events: ${payload.stats.secEvents}, event outcomes: ${payload.stats.eventOutcomes}, news items: ${payload.stats.newsItems}, stocks updated: ${payload.stats.updatedStocks}, errors: ${payload.stats.errors}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
