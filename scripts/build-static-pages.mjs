import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs", "pages");
const buildVersion = encodeURIComponent((process.env.GITHUB_SHA || `${Date.now()}`).slice(0, 12));

const dataScripts = [
  "performance-snapshot.js",
  "daily-briefing.js",
  "self-report-latest.js",
  "self-report-history.js",
  "financial-report-latest.js",
  "financial-report-history.js",
  "ir-summary-history.js",
  "tw-revenue-latest.js",
  "tw-revenue-history.js",
  "insider-holding-latest.js",
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(from, to) {
  if (!(await pathExists(from))) return;
  await fs.cp(from, to, { recursive: true });
}

async function buildIndex() {
  const indexPath = path.join(root, "web", "index.html");
  let html = await fs.readFile(indexPath, "utf8");
  html = html.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>\s*<script src="\.\/auth\.js\?v=[^"]+"><\/script>/,
    [
      ...dataScripts.map((file) => `<script src="./data/${file}?v=${buildVersion}"></script>`),
      `<script>
window.dashboardPermissions = {
  daily_briefing: true,
  us_events: true,
  us_learning: true,
  us_watchlist: true,
  tw_insider: true,
  tw_self_report: true,
  tw_financial_report: true,
  tw_ir_summary: true,
  tw_revenue: true
};
window.dashboardMember = { email: "static-pages@local" };
document.querySelector("#authRoot").hidden = true;
document.querySelector("#appShell").hidden = false;
</script>`,
      `<script src="./app.js?v=${buildVersion}"></script>`,
    ].join("\n"),
  );
  html = html.replace(/<main class="app-shell" id="appShell" hidden>/, `<main class="app-shell" id="appShell">`);
  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp(path.join(root, "web"), outputDir, { recursive: true });
  await copyIfExists(path.join(root, "api", "_data"), path.join(outputDir, "data"));
  await copyIfExists(path.join(root, "api", "_assets"), path.join(outputDir, "assets"));
  await fs.copyFile(path.join(root, "api", "_private", "app.js"), path.join(outputDir, "app.js"));
  await buildIndex();
  console.log(`Built static GitHub Pages artifact at ${path.relative(root, outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
