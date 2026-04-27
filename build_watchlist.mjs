import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs");
const outputPath = path.join(outputDir, "watchlist.xlsx");

const sourcePriority = "SEC / IR / Earnings / Press Release / Ratings / News";
const eventNotes = "法說會、產品說明會、財務公告、論壇出席、重大新聞稿、評等調整";

const groups = {
  "Mega-cap Platform / AI": [
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
  ],
  "Semiconductor / Equipment": [
    ["TSM", "Taiwan Semiconductor Manufacturing Company"],
    ["INTC", "Intel"],
    ["AMAT", "Applied Materials"],
    ["LRCX", "Lam Research"],
    ["KLAC", "KLA Corporation"],
  ],
  "Networking / Optical / Connectivity": [
    ["ANET", "Arista Networks"],
    ["CSCO", "Cisco Systems"],
    ["MRVL", "Marvell Technology"],
    ["COHR", "Coherent Corp."],
    ["LITE", "Lumentum Holdings"],
  ],
  "Power / Data Center Infrastructure": [
    ["VRT", "Vertiv Holdings"],
    ["ETN", "Eaton Corporation"],
    ["PWR", "Quanta Services"],
  ],
  "Enterprise Software": [
    ["CRM", "Salesforce"],
    ["NOW", "ServiceNow"],
  ],
};

const headers = [
  "Ticker",
  "Company Name",
  "Sector / Theme",
  "Tracking Focus",
  "Important Event Notes",
  "Source Priority",
  "Monitor Enabled",
];

const rows = Object.entries(groups).flatMap(([theme, companies]) =>
  companies.map(([ticker, name]) => [
    ticker,
    name,
    theme,
    "最新資訊、財報、earning call、重大公告、公司簡報、論壇/法說會出席、評等調整",
    eventNotes,
    sourcePriority,
    "Yes",
  ]),
);

await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const watchlist = workbook.worksheets.add("Watchlist");
const readme = workbook.worksheets.add("README");

watchlist.showGridLines = false;
readme.showGridLines = false;

watchlist.getRangeByIndexes(0, 0, rows.length + 1, headers.length).values = [headers, ...rows];

const tableRange = `A1:G${rows.length + 1}`;
const table = watchlist.tables.add(tableRange, true, "WatchlistTable");
table.style = "TableStyleMedium2";
table.showFilterButton = true;
table.showBandedColumns = false;

watchlist.freezePanes.freezeRows(1);
watchlist.getRange("A1:G1").format = {
  fill: "#1F4E79",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "Center",
  verticalAlignment: "Center",
};

watchlist.getRange("A:A").format.columnWidthPx = 82;
watchlist.getRange("B:B").format.columnWidthPx = 245;
watchlist.getRange("C:C").format.columnWidthPx = 235;
watchlist.getRange("D:D").format.columnWidthPx = 360;
watchlist.getRange("E:E").format.columnWidthPx = 360;
watchlist.getRange("F:F").format.columnWidthPx = 300;
watchlist.getRange("G:G").format.columnWidthPx = 118;
watchlist.getRange("A1:G26").format = {
  verticalAlignment: "Top",
  wrapText: true,
};
watchlist.getRange("A1:G1").format.rowHeightPx = 30;
watchlist.getRange("A2:G26").format.rowHeightPx = 46;
watchlist.getRange("A2:A26").format = { font: { bold: true }, horizontalAlignment: "Center" };
watchlist.getRange("G2:G26").format = { horizontalAlignment: "Center" };
watchlist.getRange("G2:G100").dataValidation = {
  rule: { type: "list", values: ["Yes", "No"] },
};

const themeColors = {
  "Mega-cap Platform / AI": "#EAF2F8",
  "Semiconductor / Equipment": "#E8F5E9",
  "Networking / Optical / Connectivity": "#FFF4E5",
  "Power / Data Center Infrastructure": "#F3E8FF",
  "Enterprise Software": "#E0F2FE",
};

let rowIndex = 2;
for (const [theme, companies] of Object.entries(groups)) {
  const endRow = rowIndex + companies.length - 1;
  watchlist.getRange(`A${rowIndex}:G${endRow}`).format = {
    fill: themeColors[theme],
    verticalAlignment: "Top",
    wrapText: true,
  };
  rowIndex = endRow + 1;
}

readme.getRange("A1:D1").values = [["25 檔美股監控名單", "", "", ""]];
readme.mergeCells("A1:D1");
readme.getRange("A1:D1").format = {
  fill: "#1F4E79",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "Center",
  verticalAlignment: "Center",
};
readme.getRange("A1:D1").format.rowHeightPx = 34;

readme.getRange("A3:B10").values = [
  ["欄位", "用途"],
  ["Ticker", "每日監控器使用的主要股票代號。"],
  ["Company Name", "公司名稱，依使用者提供內容保留。"],
  ["Sector / Theme", "初步研究主題分組，供報告分段與篩選使用。"],
  ["Tracking Focus", "該檔股票每日追蹤資訊類型。"],
  ["Important Event Notes", "近期重訊類型備註：法說會、產品說明會、財務公告、論壇出席等。"],
  ["Source Priority", "預設公開資料來源優先順序。"],
  ["Monitor Enabled", "每日監控器只讀取 Yes 的股票；可改成 No 暫停監控。"],
];
readme.getRange("A3:B10").format = {
  wrapText: true,
  verticalAlignment: "Top",
};
readme.getRange("A3:B3").format = {
  fill: "#D9EAF7",
  font: { bold: true },
  horizontalAlignment: "Center",
};
readme.getRange("A:A").format.columnWidthPx = 180;
readme.getRange("B:B").format.columnWidthPx = 560;
readme.getRange("A3:B10").format.rowHeightPx = 36;

readme.getRange("D3:E8").values = [
  ["主題分組", "檔數"],
  ["Mega-cap Platform / AI", 10],
  ["Semiconductor / Equipment", 5],
  ["Networking / Optical / Connectivity", 5],
  ["Power / Data Center Infrastructure", 3],
  ["Enterprise Software", 2],
];
readme.getRange("D3:E8").format = {
  wrapText: true,
  verticalAlignment: "Top",
};
readme.getRange("D3:E3").format = {
  fill: "#D9EAF7",
  font: { bold: true },
  horizontalAlignment: "Center",
};
readme.getRange("D:D").format.columnWidthPx = 260;
readme.getRange("E:E").format.columnWidthPx = 70;
readme.getRange("E4:E8").format = { horizontalAlignment: "Center" };

const contentCheck = await workbook.inspect({
  kind: "table",
  range: "Watchlist!A1:G26",
  include: "values",
  tableMaxRows: 30,
  tableMaxCols: 7,
  tableMaxCellChars: 90,
});
console.log(contentCheck.ndjson);

const errorCheck = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errorCheck.ndjson);

const watchPreview = await workbook.render({
  sheetName: "Watchlist",
  range: "A1:G26",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "watchlist_preview.png"),
  new Uint8Array(await watchPreview.arrayBuffer()),
);

const readmePreview = await workbook.render({
  sheetName: "README",
  range: "A1:E10",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "watchlist_readme_preview.png"),
  new Uint8Array(await readmePreview.arrayBuffer()),
);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`Saved ${outputPath}`);
