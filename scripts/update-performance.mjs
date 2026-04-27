import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "web", "app.js");
const outputPath = path.join(root, "web", "data", "performance-snapshot.js");

const taiwanExchangeMap = {
  1504: "TWSE",
  1513: "TWSE",
  2059: "TWSE",
  2368: "TWSE",
  2383: "TWSE",
  2449: "TWSE",
  3017: "TWSE",
  3035: "TWSE",
  3037: "TWSE",
  3081: "TPEX",
  3163: "TPEX",
  3324: "TWSE",
  3363: "TPEX",
  3443: "TWSE",
  3653: "TWSE",
  3661: "TWSE",
  3665: "TWSE",
  3711: "TWSE",
  4908: "TPEX",
  4979: "TPEX",
  5274: "TPEX",
  6213: "TWSE",
  6223: "TPEX",
  6274: "TPEX",
  6510: "TPEX",
  6515: "TWSE",
  6643: "TPEX",
  6805: "TWSE",
  8210: "TWSE",
  8996: "TWSE",
};

function unique(items) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

function extractSymbols(source) {
  const matches = source.matchAll(/(?:relatedTickers|extendedTickers):\s*\[([^\]]*)\]/g);
  const symbols = [];
  for (const match of matches) {
    for (const quoted of match[1].matchAll(/"([^"]+)"/g)) {
      const label = quoted[1].trim();
      const [symbol] = label.split(/\s+/);
      symbols.push(symbol);
    }
  }
  return unique(symbols);
}

function normalizeSymbol(symbol) {
  const isTaiwan = /^\d{4}$/.test(symbol);
  return {
    key: `${isTaiwan ? "TW" : "US"}:${symbol}`,
    symbol,
    market: isTaiwan ? "TW" : "US",
    exchange: isTaiwan ? (taiwanExchangeMap[symbol] ?? "TWSE") : "NASDAQ",
  };
}

function changeFromDailyRows(rows) {
  const valid = rows.filter((row) => row.close && !Number.isNaN(row.close));
  if (valid.length < 2) return null;
  const latest = valid[valid.length - 1];
  const base = valid[Math.max(0, valid.length - 22)];
  if (!base.close || latest.date === base.date) return null;
  return {
    asOf: latest.date,
    pct: ((latest.close - base.close) / base.close) * 100,
  };
}

function parseStooqCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).slice(1)
    .map((line) => line.split(","))
    .filter((parts) => parts.length >= 5 && parts[4] !== "No data")
    .map((parts) => ({ date: parts[0], close: Number(parts[4]) }));
  const change = changeFromDailyRows(rows);
  return change ? { ...change, provider: "Stooq daily snapshot" } : null;
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchStooqDaily(item) {
  const candidates = item.market === "TW" ? [`${item.symbol}.tw`, `${item.symbol}.t`] : [`${item.symbol.toLowerCase()}.us`];
  for (const candidate of candidates) {
    try {
      const csv = await fetchText(`https://stooq.com/q/d/l/?s=${encodeURIComponent(candidate)}&i=d`);
      const parsed = parseStooqCsv(csv);
      if (parsed) return parsed;
    } catch {
      // Try next provider/suffix.
    }
  }
  return null;
}

function parseYahooChart(data) {
  const result = data?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const rows = closes
    .map((close, index) => ({ close, timestamp: timestamps[index] }))
    .filter((row) => typeof row.close === "number" && row.timestamp)
    .map((row) => ({ date: new Date(row.timestamp * 1000).toISOString().slice(0, 10), close: row.close }));
  const change = changeFromDailyRows(rows);
  return change ? { ...change, provider: "Yahoo daily snapshot" } : null;
}

async function fetchYahooDaily(item) {
  const candidates = item.market === "TW" ? [`${item.symbol}.TW`, `${item.symbol}.TWO`] : [item.symbol];
  for (const candidate of candidates) {
    try {
      const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(candidate)}?range=2mo&interval=1d`);
      const parsed = parseYahooChart(data);
      if (parsed) return parsed;
    } catch {
      // Try next provider/suffix.
    }
  }
  return null;
}

async function fetchPerformance(item) {
  const stooq = await fetchStooqDaily(item);
  if (stooq) return stooq;
  const yahoo = await fetchYahooDaily(item);
  if (yahoo) return yahoo;
  return {
    pct: null,
    asOf: "",
    provider: item.market === "TW" ? "Taiwan quotes not included" : "Quote source unavailable",
  };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const source = await readFile(appPath, "utf8");
const items = extractSymbols(source)
  .map(normalizeSymbol)
  .filter((item) => item.market === "US");
const snapshot = {
  generatedAt: new Date().toISOString(),
  lookbackLabel: "Recent 21 trading days",
  scope: "US tickers only",
  items: {},
};

let ok = 0;
let missing = 0;
await mapLimit(items, 8, async (item) => {
  const result = await fetchPerformance(item);
  snapshot.items[item.key] = result;
  if (typeof result.pct === "number") ok += 1;
  else missing += 1;
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `window.marketPerformanceSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`,
  "utf8",
);

console.log(`Updated ${outputPath}`);
console.log(`Symbols: ${items.length}, ok: ${ok}, missing: ${missing}`);
