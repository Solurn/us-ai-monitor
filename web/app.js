const sourcePriority = "SEC / IR / Earnings / Press Release / Ratings / News";

const stockProfiles = {
  AAPL: {
    focusItems: ["iPhone demand", "Services margin", "AI roadmap", "China demand", "capital return"],
    watchReason: "Apple 目前主要看 iPhone 換機週期能否恢復、Services 高毛利是否延續，以及 Apple Intelligence 能否形成更明確的產品催化。",
    researchQuestions: ["Q2 是否延續 iPhone 17 cycle？", "管理層對 AI device / on-device AI 的說法是否更具體？"],
  },
  MSFT: {
    focusItems: ["Azure growth", "AI capex", "Copilot monetization", "OpenAI exposure", "cloud margin"],
    watchReason: "Microsoft 是 AI cloud demand 與企業軟體 monetization 的核心觀察樣本。",
    researchQuestions: ["Azure AI demand 是否仍受 supply 限制？", "Copilot 是否開始帶動 ARPU 或 seat expansion？"],
  },
  NVDA: {
    focusItems: ["Blackwell/Rubin", "gross margin", "China export controls", "hyperscaler demand", "networking"],
    watchReason: "NVIDIA 的財報通常會影響整個 AI infrastructure chain，重點在供需、毛利與下一代平台節奏。",
    researchQuestions: ["Blackwell ramp 是否順利？", "Rubin/Blackwell backlog 的能見度是否延伸到 2027？"],
  },
  AMZN: {
    focusItems: ["AWS growth", "AI infrastructure", "retail margin", "advertising", "capex"],
    watchReason: "Amazon 同時反映 cloud AI demand、consumer spending 與 retail operating leverage。",
    researchQuestions: ["AWS 是否重新加速？", "AI capex 對 FCF 與 margin 的壓力是否擴大？"],
  },
  GOOGL: {
    focusItems: ["Search AI", "Google Cloud", "TPU", "Gemini", "regulatory risk"],
    watchReason: "Alphabet 是 AI search、TPU/cloud 與廣告業務轉型的核心觀察對象。",
    researchQuestions: ["AI Overviews 是否影響 Search monetization？", "Google Cloud 與 TPU 需求是否支持 capex？"],
  },
  META: {
    focusItems: ["AI capex", "ad growth", "Reality Labs", "cost control", "engagement"],
    watchReason: "Meta 的重點在廣告韌性、AI infrastructure spending 與費用控制是否能同時成立。",
    researchQuestions: ["AI capex 是否再上修？", "Reality Labs 虧損是否繼續擴大或被管理層控制？"],
  },
  TSLA: {
    focusItems: ["Robotaxi", "Optimus", "auto margin", "energy storage", "capex"],
    watchReason: "Tesla 已公布 Q1，接下來要追的是管理層對 AI/robotics 投資與車業毛利的延續說法。",
    researchQuestions: ["Robotaxi/Optimus 的時間表是否更可驗證？", "車價與需求是否壓縮 automotive margin？"],
  },
  AVGO: {
    focusItems: ["custom AI ASIC", "VMware", "networking", "AI revenue", "margin"],
    watchReason: "Broadcom 主要看 hyperscaler custom silicon、networking 與 VMware integration。",
    researchQuestions: ["AI ASIC 客戶集中度是否改變？", "VMware 訂閱化是否持續推升 margin？"],
  },
  AMD: {
    focusItems: ["MI GPU", "EPYC server", "AI accelerator backlog", "client PC", "gross margin"],
    watchReason: "AMD 是 NVIDIA 之外最重要的 AI accelerator 與 server CPU 替代供給觀察點。",
    researchQuestions: ["MI 系列 GPU revenue 是否上修？", "EPYC share gain 是否延續？"],
  },
  ORCL: {
    focusItems: ["OCI growth", "AI backlog", "database cloud", "capex", "remaining performance obligations"],
    watchReason: "Oracle 重點是 OCI AI demand、GPU capacity 與大型雲端合約能否轉成 revenue。",
    researchQuestions: ["OCI growth 是否仍高於大型 cloud peers？", "AI backlog 何時轉收入？"],
  },
  TSM: {
    focusItems: ["AI HPC demand", "advanced nodes", "CoWoS", "gross margin", "capex"],
    watchReason: "TSMC 是整條 AI semiconductor supply chain 的需求溫度計。",
    researchQuestions: ["CoWoS/advanced packaging 供給是否仍吃緊？", "AI demand 是否足以抵消 smartphone/PC 波動？"],
  },
  INTC: {
    focusItems: ["foundry", "Xeon", "AI PC", "data center CPU", "process roadmap"],
    watchReason: "Intel 近期已公布 Q1，後續要追 server CPU demand、foundry progress 與製程里程碑。",
    researchQuestions: ["Xeon 需求是否真正回升？", "foundry business 的虧損與外部客戶進展如何？"],
  },
  AMAT: {
    focusItems: ["WFE demand", "advanced packaging", "China exposure", "services", "display"],
    watchReason: "Applied Materials 是半導體設備景氣與先進封裝投資的核心代表。",
    researchQuestions: ["WFE recovery 是否擴散到 memory/logic？", "China revenue mix 是否造成風險？"],
  },
  LRCX: {
    focusItems: ["etch/deposition", "memory capex", "advanced packaging", "China demand", "services"],
    watchReason: "Lam Research 已公布近期 call，後續可追 replay/transcript 裡的 memory 與先進製程設備需求。",
    researchQuestions: ["NAND/DRAM capex 是否復甦？", "China demand 是否被出口限制影響？"],
  },
  KLAC: {
    focusItems: ["process control", "inspection", "advanced nodes", "advanced packaging", "service revenue"],
    watchReason: "KLA 是先進製程良率與 process control 的關鍵公司，財報通常能看出 leading-edge 投資強度。",
    researchQuestions: ["先進封裝與 reticle/wafer inspection demand 是否加速？", "service revenue 是否穩定？"],
  },
  ANET: {
    focusItems: ["AI Ethernet", "cloud titan demand", "campus", "gross margin", "customer concentration"],
    watchReason: "Arista 是 AI networking / Ethernet scale-out 的核心標的，且 5 月有多場可追蹤論壇。",
    researchQuestions: ["AI networking revenue 是否上修？", "Microsoft/Meta 等 cloud titan demand 是否延續？"],
  },
  CSCO: {
    focusItems: ["AI infrastructure orders", "security", "Splunk", "enterprise networking", "guidance"],
    watchReason: "Cisco 主要看 enterprise networking 復甦、AI infrastructure orders 與 Splunk integration。",
    researchQuestions: ["AI orders 是否繼續擴大？", "Security/Splunk 是否改善 growth profile？"],
  },
  MRVL: {
    focusItems: ["custom silicon", "optical DSP", "data center", "ASIC ramp", "storage/networking"],
    watchReason: "Marvell 主要看 custom AI silicon 與 data center connectivity ramp。",
    researchQuestions: ["ASIC programs 是否開始放量？", "data center revenue growth 是否加速？"],
  },
  COHR: {
    focusItems: ["datacom optics", "photonics", "AI connectivity", "industrial lasers", "margin"],
    watchReason: "Coherent 是 AI data center optics 與 photonics supply chain 的重要觀察點。",
    researchQuestions: ["800G/1.6T demand 是否強勁？", "margin recovery 是否符合預期？"],
  },
  LITE: {
    focusItems: ["OCS", "CPO", "cloud optics", "telecom", "AI datacenter"],
    watchReason: "Lumentum 的近期財報會直接反映 optical circuit switches、CPO 與 AI cloud optics 需求。",
    researchQuestions: ["OCS/CPO 是否進入更明確的量產節奏？", "cloud customer demand 是否延續？"],
  },
  VRT: {
    focusItems: ["liquid cooling", "data center power", "backlog", "capacity expansion", "guidance"],
    watchReason: "Vertiv 已公布 Q1，後續重點在 raised guidance 是否能被訂單、產能與 margin 支撐。",
    researchQuestions: ["liquid cooling demand 是否推升中長期 margin？", "Americas organic growth 是否放緩？"],
  },
  ETN: {
    focusItems: ["electrification", "data center power", "aerospace", "orders", "margin"],
    watchReason: "Eaton 是資料中心電力、electrification 與 industrial power demand 的代表。",
    researchQuestions: ["data center power demand 是否推升 orders？", "margin 與 supply chain 是否穩定？"],
  },
  PWR: {
    focusItems: ["electric grid", "data center power", "backlog", "renewables", "utility spending"],
    watchReason: "Quanta Services 反映電網升級、資料中心電力工程與 infrastructure backlog。",
    researchQuestions: ["backlog 是否創高？", "data center/utility 專案是否帶動全年 guidance？"],
  },
  CRM: {
    focusItems: ["Agentforce", "cRPO", "margin", "AI adoption", "guidance"],
    watchReason: "Salesforce 主要看 enterprise software AI monetization、cRPO 與 margin discipline。",
    researchQuestions: ["Agentforce 是否帶動新合約？", "AI 投資是否影響 non-GAAP margin？"],
  },
  NOW: {
    focusItems: ["Now Assist", "subscription revenue", "RPO", "Armis integration", "margin"],
    watchReason: "ServiceNow 已公布 Q1，後續重點是 AI workflow demand 與 Armis acquisition 對 margin 的影響。",
    researchQuestions: ["Now Assist 大客戶成長是否延續？", "Armis 是否造成更長時間 margin 壓力？"],
  },
};

const watchlist = [
  ["AAPL", "Apple", "Mega-cap Platform / AI"],
  ["MSFT", "Microsoft", "Mega-cap Platform / AI"],
  ["NVDA", "NVIDIA", "Mega-cap Platform / AI"],
  ["AMZN", "Amazon", "Mega-cap Platform / AI"],
  ["GOOGL", "Alphabet", "Mega-cap Platform / AI"],
  ["META", "Meta Platforms", "Mega-cap Platform / AI"],
  ["TSLA", "Tesla", "Mega-cap Platform / AI"],
  ["AVGO", "Broadcom", "Mega-cap Platform / AI"],
  ["AMD", "Advanced Micro Devices", "Mega-cap Platform / AI"],
  ["ORCL", "Oracle", "Mega-cap Platform / AI"],
  ["TSM", "Taiwan Semiconductor Manufacturing Company", "Semiconductor / Equipment"],
  ["INTC", "Intel", "Semiconductor / Equipment"],
  ["AMAT", "Applied Materials", "Semiconductor / Equipment"],
  ["LRCX", "Lam Research", "Semiconductor / Equipment"],
  ["KLAC", "KLA Corporation", "Semiconductor / Equipment"],
  ["ANET", "Arista Networks", "Networking / Optical / Connectivity"],
  ["CSCO", "Cisco Systems", "Networking / Optical / Connectivity"],
  ["MRVL", "Marvell Technology", "Networking / Optical / Connectivity"],
  ["COHR", "Coherent Corp.", "Networking / Optical / Connectivity"],
  ["LITE", "Lumentum Holdings", "Networking / Optical / Connectivity"],
  ["VRT", "Vertiv Holdings", "Power / Data Center Infrastructure"],
  ["ETN", "Eaton Corporation", "Power / Data Center Infrastructure"],
  ["PWR", "Quanta Services", "Power / Data Center Infrastructure"],
  ["CRM", "Salesforce", "Enterprise Software"],
  ["NOW", "ServiceNow", "Enterprise Software"],
].map(([ticker, company, theme]) => ({
  ticker,
  company,
  theme,
  enabled: true,
  sourcePriority,
  ...stockProfiles[ticker],
}));

const upcomingEvents = [
  {
    date: "2026-04-30",
    time: "04:30",
    tickers: ["GOOGL"],
    title: "Alphabet Q1 2026 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Alphabet 公告將在美國時間 4/29 舉行 Q1 2026 financial results conference call，財報會在電話會議前於 Investor Relations 網站發布，會後提供 replay。",
    readingPoints: ["Search 與 AI Search monetization 是否被追問。", "Google Cloud growth、TPU/AI infrastructure demand、capex 上修壓力。", "若管理層提到 regulatory / antitrust，需另外標記成風險事件。"],
    source: "MarketScreener / Publicnow",
    sourceUrl: "https://www.marketscreener.com/news/alphabet-announces-date-of-first-quarter-2026-financial-results-conference-call-ce7e50dad98cf42d",
  },
  {
    date: "2026-04-30",
    time: "05:00",
    tickers: ["KLAC"],
    title: "KLA FY2026 Q3 財報與 webcast",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "KLA 公告將在美國時間 4/29 14:00 PT review FY2026 Q3 earnings；同日盤後發布 results、supplemental disclosures、shareholder letter 與 earnings slide presentation。",
    readingPoints: ["Process control / inspection demand 是否反映 leading-edge foundry、memory 與 advanced packaging 投資。", "留意 shareholder letter 對 calendar 2026 WFE、service revenue 與中國需求的描述。"],
    source: "KLA Investor Relations",
    sourceUrl: "https://ir.kla.com/news-events/press-releases/detail/513/kla-announces-third-quarter-fiscal-year-2026-earnings-date",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["MSFT"],
    title: "Microsoft FY26 Q3 財報與 earnings call",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Microsoft 公告將在美國時間 4/29 盤後發布 FY2026 Q3 financial results，並於 14:30 PT 提供 earnings conference call webcast。",
    readingPoints: ["Azure growth 與 AI services demand 是否仍 supply constrained。", "Copilot 對 ARPU、seats、RPO 的貢獻是否更可量化。", "AI capex、data center finance leases、OpenAI exposure 是重點。"],
    source: "Microsoft",
    sourceUrl: "https://news.microsoft.com/source/2026/04/08/microsoft-announces-quarterly-earnings-release-date-67/",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["AMZN"],
    title: "Amazon Q1 2026 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Amazon 公告將在美國時間 4/29 14:30 PT 舉行 Q1 2026 financial results conference call；audio 與 slides 將在 amazon.com/ir 保留至少三個月。",
    readingPoints: ["AWS growth、AI infrastructure spend 與 operating margin 是否互相拉扯。", "Retail fulfillment efficiency、advertising growth、free cash flow 是第二層重點。"],
    source: "Amazon IR",
    sourceUrl: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-to-Webcast-First-Quarter-2026-Financial-Results-Conference-Call-57c6bd583/default.aspx",
  },
  {
    date: "2026-04-30",
    time: "05:30",
    tickers: ["META"],
    title: "Meta Q1 2026 財報與 conference call",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Meta 公告 Q1 2026 financial results 將在美國時間 4/29 盤後發布，並於 14:30 PT / 17:30 ET 舉行 conference call；press release、financial tables、slide presentation 與會後 transcripts 會在 IR 網站提供。",
    readingPoints: ["AI infrastructure capex 是否再上修，以及是否影響 2026 FCF。", "Advertising growth、engagement、Reality Labs loss、成本控管與近期裁員訊息需合併閱讀。"],
    source: "Meta Investor Relations",
    sourceUrl: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-to-Announce-First-Quarter-2026-Results/default.aspx",
  },
  {
    date: "2026-04-30",
    time: "21:00",
    tickers: ["PWR"],
    title: "Quanta Services Q1 2026 財報與 webcast",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Quanta Services 公告將在美國時間 4/30 盤前發布 Q1 2026 results，09:00 ET 舉行 webcast/call；公司會同步提供 operational and financial commentary，取代大部分 prepared remarks，讓 Q&A 時間更多。",
    readingPoints: ["Operational commentary 不能只看摘要：要讀 electric infrastructure、data center power、renewables、backlog 與 end-market commentary。", "若 management 在 Q&A 提到 hyperscale data center 或 utility spending timing，要做成單獨研究筆記。"],
    source: "Barchart / PRNewswire",
    sourceUrl: "https://www.barchart.com/story/news/1321423/quanta-services-announces-first-quarter-2026-earnings-release-webcast-schedule",
  },
  {
    date: "2026-05-01",
    time: "05:00",
    tickers: ["AAPL"],
    title: "Apple Q2 FY2026 財報電話會議",
    category: "財報",
    confidence: "第三方確認",
    announcementSummary: "第三方報導稱 Apple 已確認將在美國時間 4/30 發布 FY2026 Q2 earnings，並於 14:00 PT 舉行 earnings call。官方公告連結尚未放入本頁，因此可信度標示為第三方確認。",
    readingPoints: ["留意 iPhone、Services、Mac/iPad、China demand 與 gross margin。", "若 Tim Cook / CFO 對 AI roadmap 有任何比過去更具體的語句，要完整保留，不宜過度摘要。"],
    source: "The Mac Observer",
    sourceUrl: "https://www.macobserver.com/news/apple-q2-2026-earnings-call-date-confirmed-heres-what-to-expect/",
  },
  {
    date: "2026-05-05",
    time: "23:00",
    tickers: ["ETN"],
    title: "Eaton Q1 2026 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Eaton 公告將在美國時間 5/5 紐約證交所開盤前發布 Q1 2026 earnings，並於 11:00 ET 舉行 conference call；webcast、replay 與 news release 將放在 Eaton investor presentations 頁面。",
    readingPoints: ["Data center power management、electrification、aerospace 與 orders 是重點。", "留意是否提到 AI data center 對 electrical equipment 交期、pricing、margin 的影響。"],
    source: "Eaton",
    sourceUrl: "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2026/eaton-to-announce-first-quarter-2026-earnings-on-may-5--2026.html",
  },
  {
    date: "2026-05-06",
    time: "04:30",
    tickers: ["ANET"],
    title: "Arista Networks Q1 2026 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Arista 公告將在美國時間 5/5 盤後發布 Q1 2026 results，13:30 PT / 16:30 ET 舉行 conference call；公司也同步列出 5 月多場 investor conference。",
    readingPoints: ["AI networking revenue、cloud titan demand、Ethernet vs InfiniBand、customer concentration 都要保留細節。", "如果 management 對 2026 AI networking revenue 或 large cloud customers 有新量化說法，不要只寫一句帶過。"],
    source: "Arista Investor Relations",
    sourceUrl: "https://investors.arista.com/Communications/Press-Releases-and-Events/Press-Release-Detail/2026/Arista-Networks-to-Announce-Q1-2026-Financial-Results-on-Tuesday-May-5-2026/default.aspx",
  },
  {
    date: "2026-05-06",
    time: "05:00",
    tickers: ["AMD"],
    title: "AMD Q1 2026 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "AMD 公告將在美國時間 5/5 盤後發布 fiscal Q1 2026 results，17:00 ET / 14:00 PT 舉行 conference call；同一公告也提到 CFO Jean Hu 將於 6/2 出席 BofA Global Technology Conference。",
    readingPoints: ["MI GPU ramp、EPYC server share、AI accelerator backlog、gross margin 與 guidance 是核心。", "若 management 對 GPU supply、customer pipeline 或 ROCm ecosystem 有新說法，應保留較完整段落。"],
    source: "AMD Investor Relations",
    sourceUrl: "https://ir.amd.com/news-events/press-releases/detail/1282/amd-to-report-fiscal-first-quarter-2026-financial-results",
  },
  {
    date: "2026-05-06",
    time: "05:00",
    tickers: ["LITE"],
    title: "Lumentum FY2026 Q3 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Lumentum 公告將在美國時間 5/5 盤後發布 FY2026 Q3 results，14:00 PT / 17:00 ET 舉行 audio webcast；press release 與 supporting materials 將分別放在 News Releases 與 Events。",
    readingPoints: ["Cloud & Networking、AI data center optics、OCS、CPO 是最重要的閱讀段落。", "論壇式 Q&A 若談到 customer qualification、capacity、pricing 或 cycle timing，請保留脈絡，不要只保留結論。"],
    source: "Lumentum Investor Relations",
    sourceUrl: "https://investor.lumentum.com/financial-news-releases/news-details/2026/Lumentum-to-Announce-Fiscal-Third-Quarter-2026-Financial-Results-on-May-5-2026/default.aspx",
  },
  {
    date: "2026-05-07",
    time: "04:30",
    tickers: ["COHR"],
    title: "Coherent FY2026 Q3 財報 webcast",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Coherent 公告將在美國時間 5/6 紐約證交所收盤後發布截至 2026/3/31 的 FY2026 Q3 results，並於 16:30 ET 舉行 live audio webcast；24 小時內提供 replay。",
    readingPoints: ["Datacom optics、AI connectivity、photonics、industrial lasers 與 margin recovery 是重點。", "若出現 800G/1.6T、transceiver、silicon photonics 或 cloud customer demand 相關內容，摘要要保留細節。"],
    source: "Coherent",
    sourceUrl: "https://www.coherent.com/news/press-releases/fy2026-third-quarter-conference-call-announced1",
  },
  {
    date: "2026-05-14",
    time: "23:45",
    tickers: ["ANET"],
    title: "Arista 出席 Needham Technology, Media & Consumer Conference",
    category: "論壇",
    confidence: "已公告",
    announcementSummary: "Arista 公告 CFO Chantelle Breithaupt 與 Rudolph Araujo 將於美國時間 5/14 11:45-12:25 ET 出席 Needham Technology, Media & Consumer Conference，webcast 將在 Arista IR 網站提供。",
    readingPoints: ["這類論壇不宜過度精簡：要保留主持人問題、管理層對 AI networking、cloud titan budgets、Ethernet adoption、產品週期、競爭態勢的完整回答脈絡。", "如果有提到客戶 concentration、2026 AI networking target、margin trade-off 或 supply constraints，應逐點摘錄。"],
    source: "Arista Investor Relations",
    sourceUrl: "https://investors.arista.com/Communications/Press-Releases-and-Events/Press-Release-Detail/2026/Arista-Networks-to-Announce-Q1-2026-Financial-Results-on-Tuesday-May-5-2026/default.aspx",
  },
  {
    date: "2026-05-15",
    time: "04:30",
    tickers: ["AMAT"],
    title: "Applied Materials FY2026 Q2 財報電話會議",
    category: "財報",
    confidence: "已公告",
    announcementSummary: "Applied Materials 公告將在美國時間 5/14 16:30 ET / 13:30 PT 舉行 FY2026 Q2 earnings conference call，webcast 於 ir.appliedmaterials.com 提供，replay 當日稍晚開放。",
    readingPoints: ["WFE demand、AI/advanced packaging、China exposure、memory recovery、services 是重點。", "如果管理層給出 end-market sequencing 或 tool demand visibility，請保留原本邏輯順序。"],
    source: "Nasdaq / Applied Materials",
    sourceUrl: "https://www.nasdaq.com/press-release/applied-materials-report-fiscal-second-quarter-2026-results-may-14-2026-2026-04-23",
  },
  {
    date: "2026-05-20",
    time: "02:15",
    tickers: ["ANET"],
    title: "Arista 出席 J.P. Morgan Global TMT Conference",
    category: "論壇",
    confidence: "已公告",
    announcementSummary: "Arista 公告 Chief Customer Officer Ashwin Kohli 與 Cloud and AI Networking SVP Tyson Lamoreaux 將於美國時間 5/19 14:15-14:50 ET 出席 J.P. Morgan Global Technology, Media and Communications Conference。",
    readingPoints: ["這場尤其要保留較多內容，因為出席者直接涵蓋客戶與 Cloud/AI Networking。", "重點是 cloud customer buying pattern、AI cluster networking architecture、Ethernet adoption、競爭對手比較、visibility 與 deployment timing。"],
    source: "Arista Investor Relations",
    sourceUrl: "https://investors.arista.com/Communications/Press-Releases-and-Events/Press-Release-Detail/2026/Arista-Networks-to-Announce-Q1-2026-Financial-Results-on-Tuesday-May-5-2026/default.aspx",
  },
  {
    date: "2026-05-20",
    time: "全天",
    tickers: ["GOOGL"],
    title: "Google I/O 2026 開發者大會",
    category: "產品/產業",
    confidence: "第三方確認",
    announcementSummary: "第三方報導提到 Google I/O 2026 為 5/19-5/20；這不是單一財報公告，而是產品與 AI platform event，需後續補官方 agenda/source。",
    readingPoints: ["不要過度精簡 keynote：Gemini、AI Search、Android、Cloud、TPU、developer tools、agentic AI 每一段都可能影響不同持股。", "若發布內容涉及搜尋商業模式、AI infrastructure 或 cloud 客戶，需連回 GOOGL、NVDA、ANET、AVGO、AMD 等供應鏈觀察。"],
    source: "Investor's Business Daily",
    sourceUrl: "https://www.investors.com/research/ibd-stock-of-the-day/google-ibd-stock-of-the-day-rebounding-ahead-of-first-quarter-earnings/",
  },
  {
    date: "2026-05-21",
    time: "待定",
    tickers: ["NVDA"],
    title: "NVIDIA Q1 FY2027 財報",
    category: "財報",
    confidence: "第三方預估",
    announcementSummary: "IBD 報導指出 NVIDIA Q1 earnings due May 20；目前本頁尚未放入 NVIDIA 官方公告，因此標示為第三方預估，台灣時間可能落在 5/21。",
    readingPoints: ["Blackwell/Rubin demand、gross margin、China export controls、networking、hyperscaler order visibility 必須分開記錄。", "NVIDIA 財報會影響整條 AI infrastructure chain，相關 tickers 包含 TSM、AVGO、AMD、ANET、MRVL、COHR、LITE、VRT、ETN。"],
    source: "Investor's Business Daily",
    sourceUrl: "https://www.investors.com/stock-lists/sector-leaders/nvidia-nvda-stock-ai-chip-catalysts-tech-earnings-markets/",
  },
];

const macroEvents = [
  {
    date: "2026-04-30",
    time: "02:00",
    tickers: ["MACRO"],
    title: "FOMC 利率決議與政策聲明",
    category: "央行政策",
    confidence: "官方日程",
    announcementSummary: "美國聯準會 FOMC 於 4/28-4/29 召開會議，政策聲明預定美東 4/29 14:00 公布，換算台北時間為 4/30 02:00；Fed calendar 也列出 14:30 的主席記者會。",
    readingPoints: ["看是否維持利率不變、聲明對通膨與就業的語氣是否轉鷹或轉鴿。", "成長股與 AI/雲端 capex 題材很看重長端利率，若 Powell 對降息路徑保守，NVDA、MSFT、AMZN、GOOGL、META 等高估值股可能較敏感。", "記者會要聽 Fed 對能源價格、通膨黏性與勞動市場降溫的平衡。"],
    source: "Federal Reserve calendar",
    sourceUrl: "https://www.federalreserve.gov/newsevents/2026-04.htm",
  },
  {
    date: "2026-04-30",
    time: "20:30",
    tickers: ["MACRO"],
    title: "美國 Q1 GDP advance estimate",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BEA release schedule 顯示 Q1 2026 GDP advance estimate 將於美東 4/30 08:30 公布，台北時間為 4/30 20:30。",
    readingPoints: ["GDP 是總體需求溫度計，若成長強但通膨也強，市場可能解讀為 Fed 降息空間下降。", "對大型科技股來說，GDP 本身不是唯一重點，但會影響風險偏好、美元與美債殖利率。", "可搭配同日 Personal Income and Outlays 與 ECI 一起看消費、薪資與通膨壓力。"],
    source: "BEA release schedule",
    sourceUrl: "https://www.bea.gov/news/schedule",
  },
  {
    date: "2026-04-30",
    time: "20:30",
    tickers: ["MACRO"],
    title: "Employment Cost Index Q1 2026",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BLS release schedule 顯示 Employment Cost Index Q1 2026 將於美東 4/30 08:30 公布，台北時間為 4/30 20:30。",
    readingPoints: ["ECI 是 Fed 很重視的薪資成本指標，能補足非農薪資可能受組成變化干擾的問題。", "若 ECI 偏高，市場會擔心服務通膨黏性，長端殖利率可能上行。", "高估值科技股通常對實質利率較敏感，ECI 偏熱時要留意估值壓縮。"],
    source: "BLS ECI schedule",
    sourceUrl: "https://www.bls.gov/schedule/news_release/eci.htm",
  },
  {
    date: "2026-05-01",
    time: "22:00",
    tickers: ["MACRO"],
    title: "ISM Manufacturing PMI",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "ISM release calendar 顯示 2026 年 5 月 Manufacturing PMI 將於 5/1 10:00 ET 公布，台北時間為 5/1 22:00。",
    readingPoints: ["看新訂單、就業、價格 paid；價格分項若偏熱，會加強通膨壓力敘事。", "半導體設備、工業電力與資料中心供應鏈可用它觀察製造業景氣是否擴張。", "若 PMI 轉弱但價格仍高，市場會擔心 stagflation 式的估值壓力。"],
    source: "ISM report calendar",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/",
  },
  {
    date: "2026-05-05",
    time: "22:00",
    tickers: ["MACRO"],
    title: "JOLTS Job Openings",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BLS May 2026 schedule 顯示 March 2026 JOLTS 將於美東 5/5 10:00 公布，台北時間為 5/5 22:00。",
    readingPoints: ["JOLTS 可觀察職缺、離職率與勞動需求，通常用來判斷就業市場是否真正降溫。", "若職缺仍高，Fed 可能較難快速轉鴿；若明顯下滑，市場會提高降息期待。", "軟體與雲端股對利率預期敏感，因此 JOLTS 也會間接影響估值。"],
    source: "BLS May schedule",
    sourceUrl: "https://www.bls.gov/schedule/2026/05_sched_list.htm",
  },
  {
    date: "2026-05-05",
    time: "22:00",
    tickers: ["MACRO"],
    title: "ISM Services PMI",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "ISM release calendar 顯示 2026 年 5 月 Services PMI 將於 5/5 10:00 ET 公布，台北時間為 5/5 22:00。",
    readingPoints: ["服務業占美國經濟比重高，價格 paid 與就業分項會直接影響通膨與利率預期。", "若服務業需求強、價格也強，市場可能解讀為 Fed 降息難度上升。", "對雲端、軟體、消費與廣告股，要看企業支出與服務需求是否仍穩。"],
    source: "ISM report calendar",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/",
  },
  {
    date: "2026-05-08",
    time: "20:30",
    tickers: ["MACRO"],
    title: "非農就業 NFP / Employment Situation",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BLS Employment Situation schedule 顯示 April 2026 非農就業報告將於美東 5/8 08:30 公布，台北時間為 5/8 20:30。",
    readingPoints: ["看新增非農、失業率、平均時薪與勞參率；平均時薪偏熱會增加通膨壓力。", "若就業強且薪資強，市場可能推遲降息預期；若就業降溫但不崩，對成長股通常較友善。", "AI capex 相關股短線會受利率路徑影響，但中期仍要回到各公司財報與需求能見度。"],
    source: "BLS Employment Situation schedule",
    sourceUrl: "https://www.bls.gov/schedule/news_release/empsit.htm",
  },
  {
    date: "2026-05-12",
    time: "20:30",
    tickers: ["MACRO"],
    title: "CPI 消費者物價指數",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BLS CPI schedule 顯示 April 2026 CPI 將於美東 5/12 08:30 公布，台北時間為 5/12 20:30。",
    readingPoints: ["看 headline CPI、core CPI、住房、服務、能源與二手車等分項。", "CPI 偏熱通常會推升殖利率並壓縮高估值成長股；偏冷則可能提高降息期待。", "對 NVDA、MSFT、AMZN、GOOGL、META 這類長久期成長股，CPI 是事件風險最高的總經數據之一。"],
    source: "BLS CPI schedule",
    sourceUrl: "https://www.bls.gov/schedule/news_release/cpi.htm",
  },
  {
    date: "2026-05-13",
    time: "20:30",
    tickers: ["MACRO"],
    title: "PPI 生產者物價指數",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "BLS May 2026 schedule 顯示 April 2026 PPI 將於美東 5/13 08:30 公布，台北時間為 5/13 20:30。",
    readingPoints: ["PPI 可觀察企業端成本與供應鏈價格壓力，部分分項會影響 PCE 通膨估算。", "若 PPI 與 CPI 同時偏熱，市場對 Fed 轉鴿期待會下降。", "半導體、電力設備與資料中心供應鏈可用 PPI 判斷成本壓力是否會侵蝕 margin。"],
    source: "BLS May schedule",
    sourceUrl: "https://www.bls.gov/schedule/2026/05_sched_list.htm",
  },
  {
    date: "2026-05-14",
    time: "20:30",
    tickers: ["MACRO"],
    title: "Retail Sales 零售銷售",
    category: "經濟數據",
    confidence: "官方日程",
    announcementSummary: "U.S. Census release schedule 顯示 April 2026 Advance Monthly Retail Trade Report 將於美東 5/14 08:30 公布，台北時間為 5/14 20:30。",
    readingPoints: ["零售銷售反映消費動能，control group 會進入 GDP 消費項估算。", "若消費強，AMZN、AAPL、TSLA 與廣告平台可能有正面 read-through，但也可能讓 Fed 更難降息。", "若消費弱，要分辨是價格、汽車/能源波動，還是真正的需求放緩。"],
    source: "U.S. Census retail schedule",
    sourceUrl: "https://www.census.gov/retail/release_schedule.html",
  },
];

const dailyBriefing = window.dailyBriefing ?? {
  generatedAt: "",
  asOfDate: "尚未更新",
  sourceMode: "Fallback static",
  highlights: [],
  summary: [],
  events: [],
  stockUpdates: {},
  stats: {},
  errors: [],
};

const allEvents = [...(dailyBriefing.events ?? []), ...upcomingEvents, ...macroEvents].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

const stockIntel = {
  AAPL: {
    recent: ["Q2 預覽焦點集中在 iPhone upgrade cycle、Services 穩定高毛利，以及 Apple Intelligence 對 FY2026 的產品節奏。", "Visible Alpha consensus 顯示 Q2 revenue 預期約 109.3B，Services 約 30B；市場也關心現金部位會用於回購、股利或併購。"],
    market: ["市場看法偏向：硬體需求不是爆發型題材，但 iPhone/Services 若穩定，加上 AI 功能能見度提升，仍可能支撐估值。", "風險是 AI road map 若仍模糊，或 China / supply chain commentary 偏弱，股價容易被重新定價。"],
    sources: [{ label: "S&P Global Q2 preview", url: "https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/apple-earnings-preview-q2-2026" }],
  },
  MSFT: {
    recent: ["FY26 Q3 財報即將公布，市場焦點在 Azure、AI infrastructure capex、Copilot monetization 與 OpenAI exposure。", "S&P Global 指出 hyperscaler 2026 capex consensus 持續上修，投資人會看 Microsoft 是否維持或調整全年 capex guidance。"],
    market: ["機構觀點的核心分歧不是 AI demand 有沒有，而是收入成長是否追得上 capex 增速。", "若 Azure AI demand 仍 supply constrained，短期 margin 壓力可能被視為可接受；若 capex 上修但 revenue/cRPO 沒跟上，市場會更嚴格。"],
    sources: [
      { label: "Microsoft earnings date", url: "https://news.microsoft.com/source/2026/04/08/microsoft-announces-quarterly-earnings-release-date-67/" },
      { label: "S&P Global MSFT/META preview", url: "https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/microsoft-and-meta-earnings-previews" },
    ],
  },
  NVDA: {
    recent: ["NVIDIA 下一個重大催化是 5 月下旬財報；市場等待 Blackwell/Rubin demand、gross margin、China export control 與 networking 的更新。", "GTC 後市場已把 NVIDIA 視為 AI factory 平台公司，而不是單純 GPU 供應商。"],
    market: ["市場仍偏多，但焦點從『AI 需求存在』轉為『供應、毛利與下一代平台切換是否順』。", "若 hyperscaler capex 延續上修，NVIDIA 對 TSM、AVGO、ANET、MRVL、COHR、LITE、VRT、ETN 的 read-through 會很強。"],
    sources: [{ label: "IBD NVIDIA catalysts", url: "https://www.investors.com/stock-lists/sector-leaders/nvidia-nvda-stock-ai-chip-catalysts-tech-earnings-markets/" }],
  },
  AMZN: {
    recent: ["Amazon Q1 財報即將公布；S&P Global 預覽指出 AWS consensus 約 36.8B，AWS margin consensus 約 35.7%，但估計區間很寬。", "市場也關注 FY2026 capex 是否維持高位，因 AI infrastructure 與 energy cost 對 FCF 影響變大。"],
    market: ["市場看法偏向：AWS 與廣告仍是品質較高的成長引擎，但 retail/AWS margin 變異擴大。", "若 AWS growth 不加速，而 capex 繼續上修，市場會追問 AI 投資回收期。"],
    sources: [
      { label: "Amazon IR event", url: "https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-to-Webcast-First-Quarter-2026-Financial-Results-Conference-Call-57c6bd583/default.aspx" },
      { label: "S&P Global AMZN preview", url: "https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/amazon-earnings-preview-q1-2026" },
    ],
  },
  GOOGL: {
    recent: ["Alphabet Q1 財報即將公布，市場焦點在 Search、Google Cloud、TPU/AI infrastructure 與 capex。", "KeyBanc 將 Alphabet 目標價從 370 上調至 380，主因是認為市場低估 Google Cloud 成長；其 2026 Google Cloud revenue 預估高於 consensus。"],
    market: ["機構目前較看好 Google Cloud 與 AI infrastructure，但仍關注 AI Search 對廣告 monetization 的影響。", "Google I/O 會是財報後的產品驗證點，Gemini、AI Search、Android 與 developer tools 都可能改變市場敘事。"],
    sources: [
      { label: "Alphabet event date", url: "https://www.marketscreener.com/news/alphabet-announces-date-of-first-quarter-2026-financial-results-conference-call-ce7e50dad98cf42d" },
      { label: "KeyBanc target raise", url: "https://computing.net/news/stocks/keybanc-lifts-alphabet-googl-price-target-to-380-citing-cloud-revenue-strength/" },
    ],
  },
  META: {
    recent: ["Meta Q1 財報前，市場已先看到大規模裁員與 AI capex 訊號；多家媒體報導 Meta 將裁約 8,000 人，並取消部分 open roles。", "Meta 2026 AI capex 被市場視為核心變數，財報會需要同時解釋 AI 投資、廣告成長與成本控管。"],
    market: ["市場看法分裂：多頭把裁員視為 payroll-to-GPU reallocation，空方則擔心 AI capex 壓縮 FCF 與利潤。", "若廣告業務穩定，AI spend 可能被接受；若 Reality Labs 或 AI infra 開支再擴大，市場會要求更明確 monetization。"],
    sources: [
      { label: "Meta Q1 event", url: "https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-to-Announce-First-Quarter-2026-Results/default.aspx" },
      { label: "Axios Meta layoffs", url: "https://www.axios.com/2026/04/23/meta-layoffs-ai-efficiency-push" },
    ],
  },
  TSLA: {
    recent: ["Tesla 已公布 Q1；市場焦點轉向 Cybercab、Robotaxi、Optimus 與超過 25B 的 2026 capex。", "The Verge 報導 Tesla 強調 AI/robotics 轉型；MarketBeat transcript 摘要則指出 capex 將造成 2026 negative free cash flow 壓力。"],
    market: ["市場目前不再只用 EV demand 評價 Tesla，而是用 AI/robotics story 對抗汽車需求與 margin 風險。", "分歧點是 Robotaxi/Optimus 何時能產生可量化收入，以及高 capex 是否過早壓低 FCF。"],
    sources: [
      { label: "Tesla Q1 results", url: "https://ir.tesla.com/press-release/tesla-releases-first-quarter-2026-financial-results" },
      { label: "MarketBeat TSLA transcript summary", url: "https://www.marketbeat.com/earnings/reports/2026-4-22-tesla-inc-stock/" },
    ],
  },
  AVGO: {
    recent: ["Broadcom 近期市場敘事仍圍繞 custom AI ASIC、networking 與 VMware 高毛利軟體整合。", "Google 傳出可能與 Marvell 合作開發新 TPU/AI chip variants，市場把它解讀為 Broadcom 既有 Google custom silicon 地位的潛在競爭訊號。"],
    market: ["市場仍把 Broadcom 視為 AI infrastructure 的核心 custom silicon 受益者，但也開始更仔細看 hyperscaler 是否分散供應商。", "VMware 整合若持續推升軟體 margin，可抵消半導體週期波動。"],
    sources: [
      { label: "Broadcom AI infrastructure view", url: "https://business.times-online.com/times-online/article/marketminute-2026-4-10-the-silicon-architect-broadcom-surges-5-as-ai-infrastructure-dominance-fuels-top-5-market-cap-projections" },
      { label: "Google / Marvell read-through", url: "https://timesofindia.indiatimes.com/technology/tech-news/google-may-partner-with-marvell-for-making-its-specialised-ai-chips-what-it-means-for-broadcom/articleshow/130396480.cms" },
    ],
  },
  AMD: {
    recent: ["AMD Q1 財報將在 5/5 公布；公司也公告 CFO Jean Hu 將於 6/2 出席 BofA Global Technology Conference。", "Intel 強勁 Q1 被市場視為 server CPU / AI inference demand 的正面 read-through，AMD 股價也受帶動。"],
    market: ["市場希望 AMD 的 MI GPU 與 EPYC server CPU 都能從 AI infrastructure cycle 受益。", "焦點是 MI 系列 revenue guidance 是否上修，以及 AMD 是否能把 Intel CPU read-through 轉化成自己的 share gain。"],
    sources: [
      { label: "AMD Q1 event", url: "https://ir.amd.com/news-events/press-releases/detail/1282/amd-to-report-fiscal-first-quarter-2026-financial-results" },
      { label: "Intel read-through to AMD", url: "https://www.investopedia.com/intel-post-earnings-rally-sent-its-stock-to-new-highs-these-rivals-are-getting-a-lift-too-update-11957851" },
    ],
  },
  ORCL: {
    recent: ["Oracle 近期市場焦點在 OCI AI infrastructure backlog、OpenAI 大型合約與資料中心融資能力。", "Wedbush 的 Dan Ives 以 Outperform / 220 目標價看 Oracle，認為市場誤把其 AI 投資視為高風險投機，而非長期 AI infrastructure 戰略。"],
    market: ["市場把 Oracle 視為 AI cloud infrastructure 的後起但重要玩家；優勢是低延遲 OCI、multicloud database 與大型 AI 合約。", "風險是 capex/debt financing 能否支撐巨量資料中心建設，尤其在 AI funding 市場更敏感時。"],
    sources: [
      { label: "Barron's / Wedbush ORCL", url: "https://www.barrons.com/articles/oracle-stock-buy-ai-microsoft-amazon-c70f00c5" },
      { label: "Oracle AI infrastructure narrative", url: "https://simplywall.st/community/narratives/us/software/nyse-orcl/oracle/8zuvzybv-oracle-corporation-orcl-ai-cloud-momentum-propels-stock-8percent-higher-as-q3-earnings-topple-estimates" },
    ],
  },
  TSM: {
    recent: ["TSMC Q1 已公布；市場 read-through 是 AI infrastructure demand 仍在加速，尤其 HPC、advanced nodes、CoWoS 與 capex。", "Ferrante Capital 指出 TSMC Q1 revenue、gross margin、HPC mix 與 capex 上修對 NVDA/AMD/AVGO/hyperscaler capex 都是前瞻訊號。"],
    market: ["市場把 TSM 視為 AI accelerator 與 custom ASIC 訂單能見度的上游溫度計。", "風險是 advanced packaging 供給瓶頸、地緣政治與高 capex 對折舊/毛利的長期影響。"],
    sources: [
      { label: "TSMC Q1 conference", url: "https://investor.tsmc.com/english/quarterly-results/teleconference" },
      { label: "TSMC AI read-through", url: "https://ferrantecapitaladvisers.com/insights/tsmc-q1-2026-earnings-readthrough-ai-capex/" },
    ],
  },
  INTC: {
    recent: ["Intel Q1 大幅優於市場預期，股價創多年最大漲幅；Q2 revenue guidance 也高於市場。", "Data Center and AI revenue 年增 22%，foundry revenue 年增 16%；公司把 AI inference / agentic workloads 對 CPU 的需求作為 turnaround 敘事。"],
    market: ["券商與市場明顯上修 Intel CPU demand 觀點，Citi 升至 Buy，Morgan Stanley 上調目標價但維持 Neutral。", "分歧在於：這是 AI CPU demand 帶來的真正結構性復甦，還是股價已提前反映過多期待。"],
    sources: [
      { label: "Intel official results", url: "https://www.intc.com/news-events/press-releases/detail/1767/intel-reports-first-quarter-2026-financial-results" },
      { label: "Investopedia Intel analyst reaction", url: "https://www.investopedia.com/ai-demand-is-boosting-intel-turnaround-effort-the-stock-is-rallying-to-record-highs-11957770" },
    ],
  },
  AMAT: {
    recent: ["Applied Materials 將在 5/14 公布 FY2026 Q2；市場會從財報中追 WFE demand、advanced packaging、China exposure 與 memory recovery。", "TSMC capex 上修與 AI infrastructure read-through 支撐半導體設備需求，但投資人仍會分辨哪些訂單來自先進製程、封裝或中國拉貨。"],
    market: ["市場對設備股的前瞻偏正向，但重點在訂單能見度與 China mix 品質。", "若 AMAT 對 advanced packaging / gate-all-around / service revenue 給出更強說法，會支持半導體設備 cycle 延續。"],
    sources: [
      { label: "Applied Materials event", url: "https://www.nasdaq.com/press-release/applied-materials-report-fiscal-second-quarter-2026-results-may-14-2026-2026-04-23" },
      { label: "TSMC capex read-through", url: "https://ferrantecapitaladvisers.com/insights/tsmc-q1-2026-earnings-readthrough-ai-capex/" },
    ],
  },
  LRCX: {
    recent: ["Lam Research 已於 4/22 舉行 March quarter conference call；這類 replay/transcript 對 memory capex、etch/deposition 與中國需求很重要。", "AI demand 對 advanced packaging、HBM 與 memory investment 的拉動，是 Lam 的主要 read-through。"],
    market: ["市場看法偏向半導體設備景氣進入 AI/HBM 驅動的新周期，但 memory capex 復甦速度仍是變數。", "若 Lam 對 NAND/DRAM recovery 或 advanced packaging 需求變得更明確，會改善設備股能見度。"],
    sources: [{ label: "Lam March quarter call", url: "https://newsroom.lamresearch.com/2026-04-01-Lam-Research-Corporation-Announces-March-Quarter-Financial-Conference-Call" }],
  },
  KLAC: {
    recent: ["KLA 將在 4/29 review FY2026 Q3 earnings，並同步發布 shareholder letter 與 slides。", "Q2 已表現強勁，管理層曾強調 process control 對 leading edge、memory、advanced packaging 的重要性提升。"],
    market: ["市場把 KLA 視為先進製程與良率投資的高品質設備股，通常比一般 WFE 更能反映 leading-edge intensity。", "焦點是服務收入、advanced packaging inspection、reticle/wafer inspection 與 2026 WFE commentary。"],
    sources: [{ label: "KLA Q3 event", url: "https://ir.kla.com/news-events/press-releases/detail/513/kla-announces-third-quarter-fiscal-year-2026-earnings-date" }],
  },
  ANET: {
    recent: ["Arista Q1 將在 5/5 公布，且 5 月有 Needham 與 J.P. Morgan 兩場 investor conference。", "Google Virgo Network 與 AI Hypercomputer 架構被 Evercore/市場視為對 Arista high-bandwidth AI switching 的正面 read-through。"],
    market: ["市場看法非常聚焦 Open Ethernet 在 AI clusters 的擴張，Arista 已把 2026 AI networking target 拉高。", "風險是客戶集中、Nvidia networking 競爭，以及 hyperscaler capex 若改變節奏。"],
    sources: [
      { label: "Arista event + conferences", url: "https://investors.arista.com/Communications/Press-Releases-and-Events/Press-Release-Detail/2026/Arista-Networks-to-Announce-Q1-2026-Financial-Results-on-Tuesday-May-5-2026/default.aspx" },
      { label: "IBD Google Virgo read-through", url: "https://www.investors.com/news/technology/arista-stock-high-google-cloud-ai-data-centers/" },
    ],
  },
  CSCO: {
    recent: ["Cisco 近期重點在 AI infrastructure orders、Splunk integration、security 與 sovereign infrastructure。", "Cisco 擴大 EMEA sovereign critical infrastructure suite，涵蓋 networking、security、compute、AI、collaboration、network management 與 Splunk。"],
    market: ["市場看 Cisco 是較成熟、估值較低的 AI networking/security play；AI orders 與 Splunk recurring revenue 能否改善成長 profile 是關鍵。", "相較 ANET，Cisco 的 upside 可能較穩健但彈性較小，重點在企業與政府/主權基礎建設需求。"],
    sources: [
      { label: "Cisco sovereign infrastructure", url: "https://www.itpro.com/infrastructure/cisco-is-expanding-its-sovereign-infrastructure-suite-for-emea-customers" },
      { label: "Cisco AI orders view", url: "https://futurumgroup.com/insights/cisco-q1-fy-2026-ai-demand-lifts-outlook-and-orders/" },
    ],
  },
  MRVL: {
    recent: ["Marvell 近期受到 Google 可能合作開發新 AI chip variants 的報導帶動；市場視為 custom silicon pipeline 可能再擴大。", "Futurum 研究先前指出 Marvell 的 custom silicon、electro-optics、multi-die packaging 與 NVLink integration 是 AI data center momentum 核心。"],
    market: ["市場看 Marvell 是 custom AI silicon + optics/connectivity 的槓桿股，但也擔心 hyperscaler 專案執行與客戶集中。", "若 Google/其他 hyperscaler 設計案確立，會強化 Marvell 對 Broadcom 的競爭敘事。"],
    sources: [
      { label: "Google / Marvell talks", url: "https://timesofindia.indiatimes.com/technology/tech-news/google-may-partner-with-marvell-for-making-its-specialised-ai-chips-what-it-means-for-broadcom/articleshow/130396480.cms" },
      { label: "Futurum MRVL custom silicon", url: "https://futurumgroup.com/insights/marvell-q1-fy-2026-results-driven-by-custom-silicon-and-data-center-momentum/" },
    ],
  },
  COHR: {
    recent: ["Coherent 將在 5/6 公布 FY2026 Q3；市場焦點在 datacom optics、AI connectivity、photonics 與 margin recovery。", "Lumentum 強勁結果曾被視為 Coherent 的正面 read-through，尤其 EML、200G/lane lasers 與高階光通訊需求。"],
    market: ["市場對 AI optical supply chain 偏正向，但會嚴格看產能、pricing、客戶 concentration 與毛利修復。", "若 Coherent 能確認 800G/1.6T demand、silicon photonics 或 cloud pull-in，會強化產業前景。"],
    sources: [
      { label: "Coherent Q3 event", url: "https://www.coherent.com/news/press-releases/fy2026-third-quarter-conference-call-announced1" },
      { label: "Lumentum read-through to Coherent", url: "https://www.investing.com/news/analyst-ratings/lumentums-strong-results-signal-positive-outlook-for-coherent-stock-93CH-4485388" },
    ],
  },
  LITE: {
    recent: ["Lumentum 將在 5/5 公布 FY2026 Q3；近期市場重點是 AI data center optics、OCS、CPO 與 cloud customer demand。", "IBD 指出 Lumentum 因 fiber optics / AI data center infrastructure 題材大漲，Needham 將其列為 2026 pick of the year。"],
    market: ["市場看法偏多，認為光通訊是 AI data center scaling 的瓶頸受益者之一。", "風險是股價已大幅反映期待，因此財報需要證明 revenue guidance、capacity 與 margin 都能跟上。"],
    sources: [
      { label: "Lumentum Q3 event", url: "https://investor.lumentum.com/financial-news-releases/news-details/2026/Lumentum-to-Announce-Fiscal-Third-Quarter-2026-Financial-Results-on-May-5-2026/default.aspx" },
      { label: "IBD Lumentum AI optics", url: "https://www.investors.com/stock-lists/ibd-50/lumentum-stock-lite-fiber-optics-data-center-ai-networking/" },
    ],
  },
  VRT: {
    recent: ["Vertiv Q1 已公布，EPS 與 revenue 超預期並上修全年指引；CEO 強調 AI data center 對 liquid cooling 與關鍵電力基礎設施的需求。", "公司也發布 2026 data center trends，提到 higher voltage DC、advanced liquid cooling、digital twins、on-site generation 與 gigawatt scaling。"],
    market: ["市場對 VRT 偏多，因其是 AI data center power/cooling 的直接受益者；IBD 指出多數分析師仍為 buy/outperform。", "風險是預期很高，若 backlog disclosure 變少或 Americas organic growth 放緩，股價可能短線震盪。"],
    sources: [
      { label: "Vertiv Q1 results", url: "https://investors.vertiv.com/news/news-details/2026/Vertiv-Reports-Strong-First-Quarter-with-Diluted-EPS-Growth-of-136-Adjusted-Diluted-EPS-Growth-of-83-Raises-Full-Year-Guidance/default.aspx" },
      { label: "Vertiv AI data center trends", url: "https://investors.vertiv.com/news/news-details/2026/Vertiv-Expects-Powering-Up-for-AI-Digital-Twins-and-Adaptive-Liquid-Cooling-to-Shape-Data-Center-Design-and-Operations/" },
    ],
  },
  ETN: {
    recent: ["Eaton 將在 5/5 公布 Q1；公司自己的 data center outlook 指出 AI workloads 使 power density 與 grid integration 成為 2026 核心議題。", "Eaton 提到 data centers 需要 modular systems、high-density racks、grid-interactive UPS、energy-aware infrastructure 與更快部署。"],
    market: ["市場把 Eaton 視為 AI data center electrification 與 power management 的穩健受益者。", "焦點是 orders、backlog、pricing、supply chain，以及資料中心需求是否足以支撐估值。"],
    sources: [
      { label: "Eaton Q1 event", url: "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2026/eaton-to-announce-first-quarter-2026-earnings-on-may-5--2026.html" },
      { label: "Eaton data center outlook", url: "https://www.eaton.com/us/en-us/company/news-insights/blog/blog-data-centers-market-outlook-2026-eaton.html" },
    ],
  },
  PWR: {
    recent: ["Quanta 4/30 將公布 Q1；2026 Investor Day 已把公司定位在 AI-related infrastructure、power grid modernization 與 industrial reshoring。", "市場報導指出 Quanta 管理層談到 2030 前的大型 addressable market 與近期重大合約。"],
    market: ["市場把 PWR 視為 AI power bottleneck / grid upgrade 的主要工程服務受益者。", "風險是估值已大幅反映成長，Q1 必須用 backlog、margin 與 guidance 證明需求可落地。"],
    sources: [
      { label: "Quanta Q1 webcast schedule", url: "https://www.barchart.com/story/news/1321423/quanta-services-announces-first-quarter-2026-earnings-release-webcast-schedule" },
      { label: "Quanta Investor Day read-through", url: "https://simplywall.st/stocks/us/capital-goods/nyse-pwr/quanta-services/news/quanta-services-targets-ai-power-and-grid-growth-after-2026" },
    ],
  },
  CRM: {
    recent: ["Salesforce 近期公司新聞聚焦 Agentforce IT Service；公司稱已有 180 個組織選用 Agentforce IT Service，試圖切入 ITSM market。", "這對 CRM 的意義是：Agentforce 不只是 CRM assistant，而是往 IT service / workflow automation 擴張。"],
    market: ["市場對 enterprise software AI monetization 仍有疑慮，尤其投資人會比較 AI 功能是否真的帶動 cRPO、ARR 或 seat expansion。", "若 CRM 能把 Agentforce adoption 轉成新合約與高毛利收入，市場對軟體 AI 的懷疑會下降。"],
    sources: [{ label: "Salesforce Agentforce ITSM", url: "https://www.salesforce.com/news/press-releases/2026/02/26/agentforce-it-service-selected-for-itsm/" }],
  },
  NOW: {
    recent: ["ServiceNow Q1 已公布：subscription revenue 年增 22% 至 3.67B，RPO 年增 25% 至 27.7B，並上修全年 subscription revenue outlook。", "但股價下跌，因 Armis acquisition 與相關整合成本使 margin guidance 低於市場期待。"],
    market: ["市場對 Now Assist / workflow AI demand 仍正向，但對軟體股 margin、AI 替代風險與併購整合更敏感。", "CEO Bill McDermott 強調外部 AI software threats 是 parlor tricks，但投資人仍要求更清楚的 AI revenue 與 margin proof。"],
    sources: [
      { label: "ServiceNow Q1 results", url: "https://investor.servicenow.com/news/news-details/2026/ServiceNow-Reports-First-Quarter-2026-Financial-Results/default.aspx" },
      { label: "Business Insider NOW AI commentary", url: "https://www.businessinsider.com/servicenow-ceo-dismisses-ai-threats-parlor-tricks-2026-4" },
    ],
  },
};

const stockResearchNotes = {
  AAPL: {
    eventNotes: [
      "財報電話會議要特別聽管理層是否把 Apple Intelligence 連到明確的換機週期，而不是只停留在產品功能描述。",
      "若 Services 毛利、App Store/訂閱收入與中國需求同時穩定，市場會比較願意給 Apple 硬體循環以外的估值支撐。",
    ],
    marketExpansion: [
      "目前機構對 Apple 的分歧在於：AI 是 FY2026 的實質換機催化，還是仍需要等到下一代 iPhone/裝置端 AI 才會反映。",
    ],
  },
  MSFT: {
    eventNotes: [
      "Q3 call 的重點不是單看 Azure 成長率，而是 Azure AI 是否仍受 capacity 限制，以及 management 如何描述 data center lease/capex 的回收期。",
      "Copilot 若能提供 seat expansion、ARPU 或 enterprise adoption 的具體訊號，會降低市場對 AI software monetization 的疑慮。",
    ],
    marketExpansion: [
      "機構目前通常把 Microsoft 視為 AI cloud 的核心持股，但會更嚴格比較 Azure AI revenue、OpenAI exposure 與 capex 上修幅度。",
    ],
  },
  NVDA: {
    ratingPulse: {
      label: "共識看多",
      detail: "MarketBeat 顯示 54 位分析師中 52 位為 Buy/Strong Buy；GTC 後 Raymond James 上修目標價，BTIG 與 Citi 4 月新評 Buy。",
    },
    eventNotes: [
      "GTC 2026 的核心不是單一 GPU 發表，而是 Jensen Huang 把資料中心重新定義成「AI factory」：企業買的不是晶片，而是用電力、網路與軟體把 token 產出最大化的完整系統。",
      "Vera Rubin / Rubin Ultra 被定位成 Blackwell 後的下一代 rack-scale 平台，重點包括 Vera CPU、Rubin GPU、NVLink、BlueField、ConnectX、Spectrum-X/photonic networking；這讓 NVDA 的競爭範圍從 GPU 延伸到 CPU、networking、DPU、storage/inference pipeline。",
      "GTC 內容也把投資焦點推向 inference economics：管理層強調 token throughput per watt、low latency/high throughput 的取捨，以及 co-packaged optics、liquid cooling、AI factory blueprint 對未來資料中心設計的重要性。",
      "對供應鏈的 read-through 很直接：TSM/advanced packaging 看 Rubin/Blackwell 產能，ANET/MRVL/AVGO/COHR/LITE 看 networking/optics，VRT/ETN/PWR 看 power/cooling/grid，hyperscaler capex 若延續上修，整條鏈都會被重新估值。",
    ],
    marketExpansion: [
      "目前多頭敘事從『AI 需求很強』升級成『NVDA 是 AI infrastructure operating system』；空方主要質疑 hyperscaler ROI、gross margin normalization、China restrictions 與 platform transition timing。",
      "若下次財報確認 Blackwell 出貨順、Rubin demand visibility 延伸到 2027，市場會把 GTC 的 $1T AI factory demand 敘事視為更可量化；若毛利或供應限制惡化，則容易造成整條 AI supply chain 震盪。",
    ],
    sources: [
      { label: "NVIDIA Rubin release", url: "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Kicks-Off-the-Next-Generation-of-AI-With-Rubin--Six-New-Chips-One-Incredible-AI-Supercomputer/default.aspx" },
      { label: "GTC keynote recap", url: "https://www.tomshardware.com/news/live/nvidia-gtc-2026-keynote-live-blog-jensen-huang" },
      { label: "AI factory analysis", url: "https://www.datacenterfrontier.com/machine-learning/news/55364406/jensen-huang-maps-the-ai-factory-era-at-nvidia-gtc-2026" },
      { label: "NVDA analyst consensus", url: "https://www.marketbeat.com/stocks/NASDAQ/NVDA/forecast/" },
    ],
  },
  AMZN: {
    eventNotes: [
      "Q1 call 要分開看 AWS demand 與 retail efficiency：AWS 若加速但 margin 下滑，市場會接受度較高；若 AWS 未加速但 capex 續升，會被追問 AI 投資回收期。",
      "廣告與 fulfillment efficiency 是抵消 AI capex 壓力的兩個重要緩衝，特別是 FCF 與 operating income guidance。",
    ],
    marketExpansion: [
      "機構目前偏向把 Amazon 視為 cloud AI + ads + retail leverage 的複合題材，但 AWS growth 是否重新加速仍是股價彈性的關鍵。",
    ],
  },
  GOOGL: {
    eventNotes: [
      "財報後還要接著看 Google I/O：Gemini、AI Search、Android、developer tooling 與 TPU/cloud 訊號，會決定市場如何評估 Search monetization 風險。",
      "若 Google Cloud 成長與 TPU 需求強，會支持 KeyBanc 等機構對 cloud revenue 低估的論點。",
    ],
    marketExpansion: [
      "市場對 Alphabet 的核心問題是：AI 會侵蝕 Search 毛利，還是反而提升 Cloud/TPU 與 developer ecosystem 的價值。",
    ],
  },
  META: {
    eventNotes: [
      "Meta call 要聽兩層：廣告/engagement 是否穩定，以及 AI capex 是否有更清楚的 revenue path。裁員若被解讀成 payroll-to-GPU reallocation，多頭會接受。",
      "Reality Labs loss 與 AI infrastructure spending 若同步擴大，市場會要求 management 對回收期給出更具體的框架。",
    ],
    marketExpansion: [
      "機構對 Meta 仍偏重廣告韌性與 cost discipline；AI 投入本身不是問題，問題是它是否能轉成 ad targeting、content ranking 或 business messaging 的收入。",
    ],
  },
  TSLA: {
    eventNotes: [
      "Q1 後投資重點轉向 Robotaxi、Optimus 與 2026 capex；若 management 只給願景但沒有 deployment metrics，市場會繼續用汽車毛利壓力折價。",
      "Energy storage 能否補足 auto demand 與 FCF 壓力，是 AI/robotics 敘事以外的現金流支撐點。",
    ],
    marketExpansion: [
      "目前機構分歧很大：多頭把 Tesla 視為 AI/robotics platform，空方仍把它當作需求放緩、降價與高 capex 的汽車公司。",
    ],
  },
  AVGO: {
    eventNotes: [
      "Broadcom 近期沒有單一論壇比 GTC 更關鍵，但 GTC 的 networking/photonic/co-packaged optics 訊號會直接影響市場對其 custom ASIC + networking 的估值。",
      "VMware integration 若持續提高 software margin，能讓 Broadcom 在半導體週期震盪時保有較高品質的 earnings mix。",
    ],
    marketExpansion: [
      "市場仍看好 custom AI ASIC 長線需求，但 Google/Marvell 相關報導提醒投資人：hyperscaler 可能分散供應商，Broadcom 需要證明設計案黏著度。",
    ],
  },
  AMD: {
    eventNotes: [
      "Q1 call 要看 MI accelerator revenue guidance、EPYC server share gain 與 gross margin；若只靠 PC/client rebound，AI 題材支撐會較弱。",
      "6 月 BofA conference 可追蹤 CFO 對 AI GPU supply、customer pipeline 與 server CPU demand 的補充說法。",
    ],
    marketExpansion: [
      "機構對 AMD 的期待是成為 NVIDIA 之外的 AI accelerator alternative，但市場會要求更清楚的 backlog、software ecosystem 與 margin evidence。",
    ],
  },
  ORCL: {
    eventNotes: [
      "Oracle 的重點是 OCI AI backlog 何時轉收入，以及 large AI contracts 是否需要更高 debt/capex 才能交付。",
      "若 management 能證明 database cloud、multicloud 與 AI infrastructure 是同一條商業路徑，估值會更容易被市場接受。",
    ],
    marketExpansion: [
      "機構對 ORCL 的分歧在於 AI backlog 是高品質長約，還是資料中心融資壓力的前兆；RPO、capex 與 cash flow 要一起看。",
    ],
  },
  TSM: {
    eventNotes: [
      "TSMC Q1 call 的關鍵筆記是 AI/HPC demand、CoWoS/advanced packaging capacity、capex 上修與毛利保護能力。",
      "任何對 2nm、advanced packaging 或 HBM supply chain 的 commentary，都會直接影響 NVDA/AMD/AVGO 與設備股預期。",
    ],
    marketExpansion: [
      "市場把 TSM 當成 AI accelerator 景氣的上游儀表板；只要 AI capex 沒有反轉，TSM 的先進製程與封裝議價力仍是核心。",
    ],
  },
  INTC: {
    eventNotes: [
      "Intel Q1 call 的重點是 AI inference / agentic workloads 是否真的拉動 Xeon 與 data center CPU，而不只是短期庫存或 PC 週期反彈。",
      "Foundry 進度與 process roadmap 仍是中長期估值關鍵，短線股價反應則更多來自 CPU demand 與 guidance surprise。",
    ],
    marketExpansion: [
      "Citi 升評與市場反應顯示投資人願意重新給 Intel turnaround 機會，但 Morgan Stanley 等較保守觀點提醒：執行與資本支出壓力仍大。",
    ],
  },
  AMAT: {
    eventNotes: [
      "FYQ2 call 要看 management 對 WFE、China mix、advanced packaging、services 與 gate-all-around 的說法。",
      "若 AI/HBM/advanced packaging 訂單能抵消中國需求波動，設備股 cycle 會更有延續性。",
    ],
    marketExpansion: [
      "市場對設備股偏正面，但會分辨『AI 驅動的高品質訂單』與『中國/記憶體短期拉貨』，兩者估值不同。",
    ],
  },
  LRCX: {
    eventNotes: [
      "March quarter call/replay 要特別抓 memory capex、HBM、etch/deposition intensity 與中國客戶需求。",
      "AI 伺服器拉動 HBM 與 advanced packaging，會讓 Lam 的 memory exposure 由週期題材轉向 AI supply chain 題材。",
    ],
    marketExpansion: [
      "市場目前較願意看多 memory equipment recovery，但 NAND/DRAM capex 節奏若不如預期，LRCX 仍會有波動。",
    ],
  },
  KLAC: {
    eventNotes: [
      "KLA FYQ3 會同步發布 shareholder letter 與 slides，這類資料通常比 headline EPS 更值得讀，因為會談 WFE、leading-edge、inspection 與 service revenue。",
      "AI/HBM/advanced packaging 提高良率與製程控制的重要性，KLA 的 read-through 通常比一般設備股更偏結構性。",
    ],
    marketExpansion: [
      "機構通常把 KLA 視為高品質 process control 標的；若 management 對 advanced nodes 與 packaging inspection 更樂觀，會支撐較高估值。",
    ],
  },
  ANET: {
    ratingPulse: {
      label: "多家上修",
      detail: "4 月出現 Rosenblatt Neutral 升 Buy、JPMorgan 上修目標價、Weiss/Zacks 升評；MarketBeat 顯示 25 家中 23 家 Buy/Strong Buy。",
    },
    eventNotes: [
      "5 月 Needham 與 J.P. Morgan TMT conference 要聽 AI Ethernet、XPO、campus recovery、cloud titan demand 與 2026 AI networking target 是否上修。",
      "Google Virgo / AI Hypercomputer 相關 read-through 讓市場開始討論 Arista 是否能擴大在 Google/Anthropic 等 AI cluster 的份額。",
    ],
    marketExpansion: [
      "目前機構看多重點是 Open Ethernet 在 AI clusters 的 adoption，尤其當 hyperscaler 想降低單一 networking vendor 依賴時，ANET 會被視為核心替代方案。",
      "風險是客戶集中與 NVIDIA networking 競爭；若 conference 對 AI networking revenue 只維持原目標，短線可能不夠滿足市場預期。",
    ],
    sources: [
      { label: "ANET upgrade summary", url: "https://www.marketbeat.com/instant-alerts/arista-networks-nyseanet-shares-up-86-after-analyst-upgrade-2026-04-08/" },
      { label: "ANET ratings table", url: "https://www.marketbeat.com/stocks/NYSE/ANET/forecast/" },
    ],
  },
  CSCO: {
    eventNotes: [
      "Cisco 的近期重點是 AI infrastructure orders、Splunk integration 與 sovereign infrastructure；這比單純企業網通復甦更能改變 growth profile。",
      "若管理層能把 AI orders 轉為可見 backlog，市場會更願意把 Cisco 視為 AI infrastructure/security play。",
    ],
    marketExpansion: [
      "與 ANET 相比，Cisco upside 較不爆發，但防禦性、security/observability recurring revenue 與政府/主權需求可能提供較穩定重估。",
    ],
  },
  MRVL: {
    eventNotes: [
      "Marvell 的重點是 custom silicon pipeline、optical DSP、electro-optics 與 multi-die packaging；Google 合作傳聞使市場重新評估其 ASIC 份額。",
      "任何關於 hyperscaler ASIC ramp timing 的 commentary，都會直接影響 revenue visibility 與估值。",
    ],
    marketExpansion: [
      "市場把 MRVL 視為 custom AI silicon + connectivity 槓桿股，但也因專案集中、客戶集中與產品 ramp timing 給予較高波動折價。",
    ],
  },
  COHR: {
    eventNotes: [
      "FYQ3 call 要看 800G/1.6T、silicon photonics、EML/laser demand、industrial lasers 與毛利修復。",
      "Lumentum 強勁與 AI optics 題材是正面 read-through，但 Coherent 需要用 guidance 證明自己能吃到同一波需求。",
    ],
    marketExpansion: [
      "機構看多 AI optical supply chain，但會嚴格看 capacity、pricing、客戶集中與毛利；好消息若只停在產業層面，股價反應可能有限。",
    ],
  },
  LITE: {
    eventNotes: [
      "FYQ3 call 重點是 OCS、CPO、cloud optics 與 telecom recovery；Needham 將 Lumentum 列為 2026 pick of the year 使市場期待偏高。",
      "若 management 對 cloud customer demand、capacity expansion 與 margin 只給保守說法，股價可能因預期過熱而震盪。",
    ],
    marketExpansion: [
      "市場把光通訊視為 AI data center scaling 的瓶頸受益者，LITE 因產品彈性高而被看好，但同時也是高預期標的。",
    ],
  },
  VRT: {
    ratingPulse: {
      label: "共識偏多",
      detail: "MarketBeat 顯示 26 家中 21 家 Buy，且 3 個月共識目標價由約 188 升至約 278；Goldman 4 月上修目標價。",
    },
    eventNotes: [
      "Q1 後最重要的管理層訊號是全年 guidance 上修是否由 backlog、capacity 與 pricing 支撐，而不是單純短期需求拉貨。",
      "Vertiv 的 data center trends 把 higher voltage DC、advanced liquid cooling、digital twins、on-site generation 與 gigawatt scaling 都放進 2026 主軸，這代表公司把 AI data center 視為長周期，而非單季題材。",
    ],
    marketExpansion: [
      "市場看 VRT 是 AI power/cooling 最直接受益者之一；但因股價已大幅反映期待，之後要追蹤 backlog disclosure、Americas organic growth 與 margin。",
    ],
    sources: [
      { label: "VRT ratings / target trend", url: "https://www.marketbeat.com/stocks/NYSE/VRT/forecast/" },
    ],
  },
  ETN: {
    eventNotes: [
      "Q1 call 要看 data center power orders、electrical Americas margin、aerospace demand 與供應鏈穩定度。",
      "Eaton 自家 outlook 強調 AI workloads 推升 power density、modular deployment、grid-interactive UPS 與 energy-aware infrastructure。",
    ],
    marketExpansion: [
      "市場把 ETN 視為較穩健的 AI electrification 標的；不像 VRT 那麼直接，但在資料中心、工業電力與航空三條線都有支撐。",
    ],
  },
  PWR: {
    eventNotes: [
      "Q1 call 與 Investor Day 要讀 backlog、large project timing、utility spending、data center power 與 grid modernization。",
      "AI power bottleneck 使 Quanta 的電網/工程服務角色更重要，但收入確認節奏與 margin 是市場最在意的落地指標。",
    ],
    marketExpansion: [
      "市場對 PWR 的前瞻偏多，主因是 data center + grid upgrade 的長周期需求；風險是估值已高，若 backlog 轉收入慢，會被修正。",
    ],
  },
  CRM: {
    eventNotes: [
      "Agentforce IT Service 的意義是 Salesforce 試圖把 AI 從 CRM assistant 擴到 ITSM/workflow automation，這能否變成 paid adoption 是下一步。",
      "後續財報要看 Agentforce 對 cRPO、ARR、seat expansion 與 margin 的實際貢獻，而不是只看產品發布。",
    ],
    marketExpansion: [
      "機構對軟體 AI monetization 仍偏謹慎；CRM 若能證明 AI agent 真的帶動新合約，會改善整個 enterprise software 的市場敘事。",
    ],
  },
  NOW: {
    eventNotes: [
      "Q1 已證明 subscription revenue 與 RPO 仍強，但 Armis acquisition 與 margin guidance 讓市場更敏感。",
      "CEO 對 AI software threat 的回應很強硬，但投資人還是會要求 Now Assist 的 adoption、pricing 與 workflow ROI。",
    ],
    marketExpansion: [
      "市場仍看好 ServiceNow 的 workflow moat，但對軟體股的 AI 替代風險、併購整合與 margin 壓力容忍度下降。",
    ],
  },
};

Object.entries(dailyBriefing.stockUpdates ?? {}).forEach(([ticker, update]) => {
  if (!stockIntel[ticker]) stockIntel[ticker] = { recent: [], market: [], sources: [] };
  const autoItems = (update.items ?? []).map((item) => `自動更新：${item}`);
  const autoSources = update.sources ?? [];
  stockIntel[ticker].recent = [...autoItems, ...(stockIntel[ticker].recent ?? [])].slice(0, 7);
  stockIntel[ticker].sources = [...autoSources, ...(stockIntel[ticker].sources ?? [])].slice(0, 8);
});

const learningTopics = [
  {
    id: "ai-factory",
    title: "AI Factory / AI 工廠",
    category: "AI 基礎設施",
    relatedTickers: ["NVDA", "MSFT", "AMZN", "GOOGL", "META", "ORCL", "VRT", "ETN", "PWR"],
    extendedTickers: ["SMCI", "DELL", "HPE", "FLEX", "JBL"],
    taiwanTickers: ["8210 勤誠", "2059 川湖", "3665 貿聯-KY", "6805 富世達"],
    plain: "可以把它想成新型資料中心：以前資料中心主要存資料、跑網站；AI factory 則是把電力、GPU、CPU、網路、儲存與軟體整合起來，持續生產 token，也就是 AI 回答、推理與代理任務的產出。",
    why: "投資上，它把焦點從單顆 GPU 轉成整套基礎建設。NVDA 賣的是平台，雲端公司買的是 AI 產能，電力、散熱、網路、封裝與工程服務都會變成受益鏈。",
    bottlenecks: ["電力與併網速度", "液冷與機房改造", "GPU/先進封裝供給", "高速網路與光通訊", "AI 應用能否創造足夠收入"],
    watch: "若 hyperscaler capex 繼續上修，NVDA、VRT、ETN、PWR、ANET、MRVL、AVGO、TSM 的 read-through 會比較強；若市場開始質疑 AI ROI，整條鏈會一起承壓。",
    sources: [
      { label: "NVIDIA DSX AI factory", url: "https://nvidianews.nvidia.com/news/nvidia-releases-vera-rubin-dsx-ai-factory-reference-design-and-omniverse-dsx-digital-twin-blueprint-with-broad-industry-support" },
    ],
  },
  {
    id: "rack-scale",
    title: "Rack-scale 平台 / Vera Rubin NVL72",
    category: "運算平台",
    relatedTickers: ["NVDA", "TSM", "VRT", "ETN", "PWR"],
    extendedTickers: ["SMCI", "DELL", "HPE", "FLEX", "JBL"],
    taiwanTickers: ["8210 勤誠", "2059 川湖", "6805 富世達", "3017 奇鋐", "3324 雙鴻"],
    plain: "Rack-scale 是把一整櫃伺服器當成一台超級電腦設計，而不是把很多單台伺服器硬接起來。Vera Rubin NVL72 就是把 Rubin GPU、Vera CPU、NVLink、網卡、DPU 與散熱設計整合在同一個 rack 架構裡。",
    why: "AI 模型越大，單顆 GPU 不夠用，必須讓很多 GPU 像一台機器一樣協作。誰能把 rack 的速度、耗電、散熱、維護效率做好，誰就能降低每個 token 的成本。",
    bottlenecks: ["整櫃供電密度", "液冷部署", "GPU 間延遲", "良率與組裝速度", "雲端客戶導入節奏"],
    watch: "NVDA 是平台核心，TSM 看晶片與封裝，VRT/ETN/PWR 看資料中心供電與工程，DELL/SMCI 類伺服器鏈則看整櫃交付能力。",
    sources: [
      { label: "NVIDIA Vera Rubin NVL72", url: "https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/" },
      { label: "Vera Rubin platform", url: "https://nvidianews.nvidia.com/news/nvidia-vera-rubin-platform" },
    ],
  },
  {
    id: "vera-rubin",
    title: "Vera CPU 與 Rubin GPU",
    category: "運算平台",
    relatedTickers: ["NVDA", "AMD", "INTC", "TSM"],
    extendedTickers: ["ARM", "QCOM", "MU"],
    taiwanTickers: ["3661 世芯-KY", "3443 創意", "3035 智原", "6643 M31"],
    plain: "GPU 擅長大量平行運算，像同時算很多矩陣；CPU 擅長控制流程、資料處理與跑工具。Agentic AI 需要模型自己呼叫工具、寫程式、查資料、驗證結果，所以 CPU 與 GPU 的協作會變得更重要。",
    why: "Vera CPU 代表 NVDA 不只想賣 GPU，而是要把 AI workload 裡的控制、資料、推理與工具執行都納入平台。這會擴大 NVDA 的市場，也會對 AMD/INTC 的 data center CPU 形成壓力。",
    bottlenecks: ["CPU/GPU 協同效率", "記憶體頻寬", "軟體生態", "客戶是否接受 NVDA 更完整的平台綁定"],
    watch: "若 agentic AI 與 reinforcement learning workload 增長，CPU 在 AI rack 裡的重要性會提高，NVDA、AMD、INTC 的競爭敘事都會改變。",
    sources: [
      { label: "NVIDIA Vera CPU Rack", url: "https://www.nvidia.com/en-us/data-center/products/vera-rack/" },
    ],
  },
  {
    id: "nvlink",
    title: "NVLink / Scale-up Interconnect",
    category: "傳輸與網路",
    relatedTickers: ["NVDA", "AVGO", "MRVL", "ANET"],
    extendedTickers: ["ALAB", "CRDO", "APH", "TEL"],
    taiwanTickers: ["2383 台光電", "6274 台燿", "2368 金像電", "3665 貿聯-KY"],
    plain: "NVLink 可以理解成 GPU 之間的超高速內部道路。一般網路像城市道路，NVLink 則像同一個園區裡的專用高速通道，目標是讓多顆 GPU 交換資料時延遲更低、頻寬更高。",
    why: "大模型訓練與推理常需要很多 GPU 同步工作，GPU 之間如果傳太慢，昂貴的 GPU 就會等資料而閒置。互連效率會直接影響 AI factory 的產出成本。",
    bottlenecks: ["頻寬與延遲", "交換晶片設計", "線材/背板複雜度", "散熱與功耗", "跨 rack 擴展難度"],
    watch: "NVDA 的優勢在於 GPU + NVLink + networking 一起設計；AVGO/MRVL/ANET 則與更廣義的交換、ASIC、Ethernet AI fabric 相關。",
    sources: [
      { label: "Vera Rubin POD technical blog", url: "https://developer.nvidia.com/blog/nvidia-vera-rubin-pod-seven-chips-five-rack-scale-systems-one-ai-supercomputer/" },
    ],
  },
  {
    id: "dpu-supernic",
    title: "BlueField DPU / ConnectX SuperNIC",
    category: "傳輸與網路",
    relatedTickers: ["NVDA", "ANET", "CSCO", "MRVL", "AVGO"],
    extendedTickers: ["ALAB", "CRDO", "JNPR", "HPE"],
    taiwanTickers: ["2383 台光電", "6274 台燿", "2368 金像電", "3665 貿聯-KY"],
    plain: "NIC 是網卡，負責把伺服器接到網路；DPU 可以想成有小 CPU 的智慧網卡，會把安全、儲存、網路封包處理等工作從主 CPU/GPU 身上卸下來。",
    why: "AI cluster 裡資料流量非常大，如果 CPU/GPU 還要處理一堆網路與儲存雜務，算力會被浪費。DPU/SuperNIC 能讓 GPU 更專心產生 token。",
    bottlenecks: ["軟體整合", "資料中心網路架構", "安全與隔離需求", "客戶是否採用端到端平台"],
    watch: "NVDA 想把 BlueField/ConnectX 與 GPU 平台綁緊；ANET/CSCO/MRVL/AVGO 則是不同層級的網路與資料中心晶片受益或競爭者。",
    sources: [
      { label: "NVIDIA Spectrum Ethernet platform", url: "https://www.nvidia.com/en-us/networking/products/ethernet" },
    ],
  },
  {
    id: "silicon-photonics",
    title: "矽光子 / Co-packaged Optics / 光通訊",
    category: "傳輸與網路",
    relatedTickers: ["NVDA", "COHR", "LITE", "MRVL", "AVGO", "ANET", "TSM"],
    extendedTickers: ["CIEN", "AAOI", "FN", "GLW", "APH", "TEL", "NXT"],
    taiwanTickers: ["3081 聯亞", "3163 波若威", "4979 華星光", "3363 上詮", "4908 前鼎"],
    plain: "傳統晶片裡資料多用電訊號移動，但距離拉長、速度變快後會很耗電又容易失真。矽光子是把光學元件做進矽晶片或封裝附近，用光來傳資料；CPO 則是把光學模組放得更靠近交換晶片，減少耗電與訊號損失。",
    why: "AI cluster 越大，GPU 之間要搬的資料越多，網路耗電會變成大問題。光通訊能降低傳輸耗電、提高頻寬，讓百萬 GPU 等級的 AI factory 更可能落地。",
    bottlenecks: ["雷射與光引擎良率", "封裝與組裝自動化", "散熱", "維修便利性", "標準化與客戶導入"],
    watch: "NVDA GTC 提到 Spectrum-X Photonics；COHR/LITE 是光通訊供應鏈焦點，MRVL/AVGO 看 DSP/custom silicon，ANET 看 AI Ethernet switch，TSM 則與矽光子/先進封裝供應鏈相關。",
    sources: [
      { label: "NVIDIA silicon photonics", url: "https://www.nvidia.com/en-us/networking/products/silicon-photonics/" },
      { label: "Spectrum-X Photonics release", url: "https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Announces-Spectrum-X-Photonics-Co-Packaged-Optics-Networking-Switches-to-Scale-AI-Factories-to-Millions-of-GPUs/" },
      { label: "Spectrum-X technical blog", url: "https://developer.nvidia.com/blog/scaling-power-efficient-ai-factories-with-nvidia-spectrum-x-ethernet-photonics/" },
    ],
  },
  {
    id: "cowos-hbm",
    title: "CoWoS / 先進封裝 / HBM",
    category: "製程與封裝",
    relatedTickers: ["TSM", "NVDA", "AMD", "AVGO", "AMAT", "LRCX", "KLAC"],
    extendedTickers: ["MU", "ASML", "AMKR", "ONTO", "TER", "MKSI", "AEHR"],
    taiwanTickers: ["3711 日月光投控", "2449 京元電子", "6515 穎崴", "6223 旺矽", "6510 精測"],
    plain: "先進 AI 晶片不是只有一顆裸晶，而是把 GPU、HBM 高頻寬記憶體與其他晶片用先進封裝放在一起。CoWoS 是 TSMC 重要的先進封裝技術，能讓 GPU 更快存取大量記憶體。",
    why: "AI 計算常常不是算力不夠，而是資料餵不夠快。HBM 與先進封裝能提高資料供給速度，所以它們常是 AI accelerator 產能的瓶頸。",
    bottlenecks: ["CoWoS 產能", "HBM 供給", "封裝良率", "基板與材料", "設備交期"],
    watch: "TSM 是上游溫度計；AMAT/LRCX/KLAC 看設備與製程控制；NVDA/AMD/AVGO 的 AI 晶片出貨會受封裝與 HBM 供給影響。",
    sources: [
      { label: "TSMC quarterly results", url: "https://investor.tsmc.com/english/quarterly-results/teleconference" },
    ],
  },
  {
    id: "spectrum-ethernet",
    title: "Spectrum-X / AI Ethernet",
    category: "傳輸與網路",
    relatedTickers: ["NVDA", "ANET", "CSCO", "AVGO", "MRVL"],
    extendedTickers: ["ALAB", "CRDO", "JNPR", "APH", "TEL"],
    taiwanTickers: ["2383 台光電", "6274 台燿", "2368 金像電", "3037 欣興", "6213 聯茂"],
    plain: "Ethernet 是資料中心常見網路標準，但一般 Ethernet 不一定適合 AI cluster 的同步訓練與低延遲需求。AI Ethernet 是把交換器、網卡、軟體與壅塞控制做得更適合 AI workload。",
    why: "如果 AI Ethernet 成為主流，ANET、CSCO、AVGO、MRVL 都會有機會；但 NVDA 也用 Spectrum-X 把自己推進 Ethernet 市場，競爭會變更激烈。",
    bottlenecks: ["低延遲與封包遺失控制", "與 GPU 平台整合", "客戶是否採用開放 Ethernet", "NVIDIA networking 競爭"],
    watch: "ANET 是 Open Ethernet AI networking 的重點標的；CSCO 偏企業與安全整合；AVGO/MRVL 看交換晶片、custom silicon 與 connectivity。",
    sources: [
      { label: "NVIDIA Ethernet platform", url: "https://www.nvidia.com/en-us/networking/products/ethernet" },
    ],
  },
  {
    id: "power-cooling",
    title: "液冷 / 高壓直流 / 資料中心供電",
    category: "電力與散熱",
    relatedTickers: ["VRT", "ETN", "PWR", "NVDA", "TSM"],
    extendedTickers: ["GEV", "CEG", "VST", "FIX", "MOD", "CARR", "TT", "JCI", "GNRC"],
    taiwanTickers: ["3017 奇鋐", "3324 雙鴻", "3653 健策", "8996 高力", "1513 中興電", "1504 東元"],
    plain: "GPU rack 功耗越來越高，傳統風冷和舊機房供電很難撐住。液冷是用液體帶走熱，高壓直流與新型配電則是讓電力更有效率地送進機櫃。",
    why: "AI 投資不只買晶片，還要有電、有冷卻、有電網工程。這就是為什麼 VRT、ETN、PWR 會被市場拿來當 AI infrastructure 受益股。",
    bottlenecks: ["電網併網排隊", "變壓器與電力設備供給", "液冷標準化", "機房改造成本", "水資源與能源成本"],
    watch: "VRT 看液冷與關鍵電力設備，ETN 看 power management 與 electrification，PWR 看電網工程與大型專案 backlog。",
    sources: [
      { label: "Vertiv data center trends", url: "https://investors.vertiv.com/news/news-details/2026/Vertiv-Expects-Powering-Up-for-AI-Digital-Twins-and-Adaptive-Liquid-Cooling-to-Shape-Data-Center-Design-and-Operations/" },
      { label: "Eaton data center outlook", url: "https://www.eaton.com/us/en-us/company/news-insights/blog/blog-data-centers-market-outlook-2026-eaton.html" },
    ],
  },
  {
    id: "token-economics",
    title: "Inference Economics / Token 成本",
    category: "AI 商業模式",
    relatedTickers: ["NVDA", "MSFT", "AMZN", "GOOGL", "META", "ORCL", "CRM", "NOW"],
    extendedTickers: ["PLTR", "SNOW", "DDOG", "MDB", "ADBE", "INTU", "UBER"],
    plain: "Token 可以想成 AI 回答時產生的文字或資料片段。Inference economics 就是在問：產生每一百萬個 token 要花多少電、多少 GPU 時間、多少網路與資料中心成本。",
    why: "AI 應用最後要賺錢，不能只看模型很強。若 token 成本下降，雲端與軟體公司比較容易把 AI 功能商業化；若成本太高，capex 就會變成利潤壓力。",
    bottlenecks: ["GPU 利用率", "模型大小與推理效率", "電力成本", "記憶體與網路瓶頸", "用戶是否願意付費"],
    watch: "NVDA 看硬體降低成本，MSFT/AMZN/GOOGL/ORCL 看雲端 AI revenue，CRM/NOW 看 enterprise AI 是否能轉成 ARR/cRPO。",
    sources: [
      { label: "Vera Rubin NVL72", url: "https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/" },
    ],
  },
  {
    id: "custom-asic",
    title: "Custom AI ASIC / TPU",
    category: "運算平台",
    relatedTickers: ["AVGO", "MRVL", "GOOGL", "AMZN", "MSFT", "META", "NVDA", "TSM"],
    extendedTickers: ["ARM", "SNPS", "CDNS"],
    taiwanTickers: ["3661 世芯-KY", "3443 創意", "3035 智原", "6643 M31", "5274 信驊"],
    plain: "GPU 是通用 AI 加速器；custom ASIC 則是雲端大客戶為自己的 AI workload 設計的專用晶片。Google TPU 就是典型例子。",
    why: "若 hyperscaler 越來越多使用自研 ASIC，會降低部分對 GPU 的依賴，也會讓 AVGO/MRVL/TSM 這類 custom silicon 與製造鏈受益。",
    bottlenecks: ["設計週期長", "軟體生態不如 GPU 彈性", "客戶集中", "量產與封裝風險", "是否真的比 GPU 便宜"],
    watch: "AVGO 是既有 custom silicon 代表，MRVL 受 Google/其他 hyperscaler 設計案期待帶動，GOOGL/AMZN/MSFT/META 是潛在自研晶片需求方。",
    sources: [
      { label: "Google / Marvell read-through", url: "https://timesofindia.indiatimes.com/technology/tech-news/google-may-partner-with-marvell-for-making-its-specialised-ai-chips-what-it-means-for-broadcom/articleshow/130396480.cms" },
    ],
  },
];

const learningCategories = ["全部", ...Array.from(new Set(learningTopics.map((topic) => topic.category)))];

const state = {
  theme: "All",
  query: "",
  view: "cards",
  eventCategory: "全部",
  learningCategory: "全部",
};

const themeOrder = [
  "All",
  "Mega-cap Platform / AI",
  "Semiconductor / Equipment",
  "Networking / Optical / Connectivity",
  "Power / Data Center Infrastructure",
  "Enterprise Software",
];

const eventCategories = ["全部", ...Array.from(new Set(allEvents.map((event) => event.category)))];

const grid = document.querySelector("#stockGrid");
const filters = document.querySelector("#themeFilters");
const searchInput = document.querySelector("#searchInput");
const toggleButtons = document.querySelectorAll(".toggle-button");
const totalCount = document.querySelector("#totalCount");
const eventCount = document.querySelector("#eventCount");
const eventFilters = document.querySelector("#eventFilters");
const eventList = document.querySelector("#eventList");
const learningCount = document.querySelector("#learningCount");
const learningFilters = document.querySelector("#learningFilters");
const learningList = document.querySelector("#learningList");
const briefingAsOf = document.querySelector("#briefingAsOf");
const briefingMetric = document.querySelector("#briefingMetric");
const briefingMode = document.querySelector("#briefingMode");
const briefingUpdated = document.querySelector("#briefingUpdated");
const briefingStats = document.querySelector("#briefingStats");
const briefingList = document.querySelector("#briefingList");
const dataStatusText = document.querySelector("#dataStatusText");

function themeCount(theme) {
  if (theme === "All") return watchlist.length;
  return watchlist.filter((stock) => stock.theme === theme).length;
}

function relatedEvents(ticker) {
  return allEvents.filter((event) => event.tickers.includes(ticker));
}

function renderFilters() {
  filters.innerHTML = themeOrder
    .map(
      (theme) => `
        <button class="chip ${state.theme === theme ? "active" : ""}" type="button" data-theme="${theme}">
          <span>${theme === "All" ? "全部" : theme}</span>
          <span class="chip-count">${themeCount(theme)}</span>
        </button>
      `,
    )
    .join("");

  filters.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.theme;
      render();
    });
  });
}

function filteredStocks() {
  const query = state.query.trim().toLowerCase();
  return watchlist.filter((stock) => {
    const matchesTheme = state.theme === "All" || stock.theme === state.theme;
    const research = stockResearchNotes[stock.ticker];
    const researchText = research
      ? `${research.ratingPulse?.label ?? ""} ${research.ratingPulse?.detail ?? ""} ${(research.eventNotes ?? []).join(" ")} ${(research.marketExpansion ?? []).join(" ")}`
      : "";
    const haystack = `${stock.ticker} ${stock.company} ${stock.theme} ${stock.watchReason} ${stock.focusItems.join(" ")} ${researchText}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesTheme && matchesQuery;
  });
}

function filteredEvents() {
  const query = state.query.trim().toLowerCase();
  return allEvents.filter((event) => {
    const matchesCategory = state.eventCategory === "全部" || event.category === state.eventCategory;
    const haystack = `${event.tickers.join(" ")} ${event.title} ${event.announcementSummary} ${event.readingPoints.join(" ")} ${event.category}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });
}

function filteredLearningTopics() {
  const query = state.query.trim().toLowerCase();
  return learningTopics.filter((topic) => {
    const matchesCategory = state.learningCategory === "全部" || topic.category === state.learningCategory;
    const haystack = `${topic.title} ${topic.category} ${topic.relatedTickers.join(" ")} ${(topic.extendedTickers ?? []).join(" ")} ${(topic.taiwanTickers ?? []).join(" ")} ${topic.plain} ${topic.why} ${topic.bottlenecks.join(" ")} ${topic.watch}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });
}

function topicsForStock(ticker) {
  return learningTopics.filter((topic) => topic.relatedTickers.includes(ticker)).slice(0, 5);
}

const performanceCache = new Map();

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

function normalizeTickerEntry(entry) {
  const value = String(entry).trim();
  const [symbol] = value.split(/\s+/);
  const isTaiwan = /^\d{4}$/.test(symbol);
  return {
    label: value,
    symbol,
    market: isTaiwan ? "TW" : "US",
    exchange: isTaiwan ? (taiwanExchangeMap[symbol] ?? "TWSE") : "NASDAQ",
  };
}

function tradingViewSymbol(item) {
  if (item.market === "TW") return `${item.exchange}:${item.symbol}`;
  return `NASDAQ:${item.symbol}`;
}

function performanceTone(pct) {
  if (pct == null || Number.isNaN(pct)) return "missing";
  if (pct > 0.35) return "positive";
  if (pct < -0.35) return "negative";
  return "flat";
}

function formatPct(pct) {
  if (pct == null || Number.isNaN(pct)) return "--";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function tickerBadge(entry) {
  const item = normalizeTickerEntry(entry);
  const tvUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol(item))}`;
  if (item.market === "TW") {
    return `<a class="ticker-badge perf-static" href="${tvUrl}" target="_blank" rel="noreferrer" data-tooltip="${item.label}：台股延伸標的，點擊開 TradingView">${item.label}</a>`;
  }
  return `<a class="ticker-badge perf-missing" href="${tvUrl}" target="_blank" rel="noreferrer" data-symbol="${item.symbol}" data-market="${item.market}" data-tooltip="${item.label}：近 21 個交易日資料載入中">${item.label}</a>`;
}

function averagePayload(tickers) {
  return tickers
    .map((entry) => normalizeTickerEntry(entry))
    .filter((item) => item.market === "US")
    .map((item) => `${item.market}:${item.symbol}`)
    .join(",");
}

function tickerGroup(label, tickers, variant = "", groupId = "") {
  if (!tickers?.length) return "";
  const payload = averagePayload(tickers);
  return `
    <span class="ticker-group ${variant}" data-group="${groupId}">
      <span class="ticker-group-label">${label}</span>
      ${payload ? `<span class="group-average" data-average-symbols="${payload}">21日均 --</span>` : ""}
      <span class="learning-tickers">
        ${tickers.map((ticker) => tickerBadge(ticker)).join("")}
      </span>
    </span>
  `;
}

function changeFromDailyRows(rows) {
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1];
  const base = rows[Math.max(0, rows.length - 22)];
  const latestClose = latest.close;
  const baseClose = base.close;
  if (!baseClose || latest.date === base.date) return null;
  return {
    asOf: latest.date,
    pct: ((latestClose - baseClose) / baseClose) * 100,
  };
}

function parseStooqDailyCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).slice(1)
    .map((line) => line.split(","))
    .filter((parts) => parts.length >= 5 && parts[4] !== "No data" && !Number.isNaN(Number(parts[4])));
  const change = changeFromDailyRows(rows.map((parts) => ({ date: parts[0], close: Number(parts[4]) })));
  return change ? { ...change, provider: "Stooq daily" } : null;
}

async function fetchStooqDaily(symbol, market) {
  const candidates = market === "TW" ? [`${symbol}.tw`, `${symbol}.t`] : [`${symbol.toLowerCase()}.us`];
  for (const stooqSymbol of candidates) {
    try {
      const response = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`, { cache: "no-store" });
      if (!response.ok) continue;
      const parsed = parseStooqDailyCsv(await response.text());
      if (parsed) return parsed;
    } catch (error) {
      // Try the next suffix.
    }
  }
  return null;
}

function parseYahooDailyChart(data) {
  const result = data?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const rows = closes
    .map((close, index) => ({ close, timestamp: timestamps[index] }))
    .filter((item) => typeof item.close === "number" && item.timestamp)
    .map((item) => ({ date: new Date(item.timestamp * 1000).toISOString().slice(0, 10), close: item.close }));
  const change = changeFromDailyRows(rows);
  return change ? { ...change, provider: "Yahoo daily" } : null;
}

async function fetchYahooDaily(symbol, market) {
  const candidates = market === "TW" ? [`${symbol}.TW`, `${symbol}.TWO`] : [symbol];
  for (const yahooSymbol of candidates) {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=2mo&interval=1d`, { cache: "no-store" });
      if (!response.ok) continue;
      const parsed = parseYahooDailyChart(await response.json());
      if (parsed) return parsed;
    } catch (error) {
      // Try the next suffix.
    }
  }
  return null;
}

async function getRecentPerformance(symbol, market) {
  const key = `${market}:${symbol}`;
  if (!performanceCache.has(key)) {
    performanceCache.set(
      key,
      (async () => {
        const snapshot = window.marketPerformanceSnapshot?.items?.[key];
        if (snapshot && typeof snapshot.pct === "number") {
          return { ...snapshot, provider: `${snapshot.provider ?? "local snapshot"}` };
        }
        try {
          const stooq = await fetchStooqDaily(symbol, market);
          if (stooq) return stooq;
        } catch (error) {
          // Fall through to Yahoo; some symbols or browsers may block one provider.
        }
        try {
          const yahoo = await fetchYahooDaily(symbol, market);
          if (yahoo) return yahoo;
        } catch (error) {
          // A visible "not connected" state is better than stale or invented performance.
        }
        return { pct: null, asOf: "", provider: market === "TW" ? "免費台股行情源未覆蓋" : "資料源未連線" };
      })(),
    );
  }
  return performanceCache.get(key);
}

async function hydrateTickerPerformance(root = document) {
  const badges = Array.from(root.querySelectorAll(".ticker-badge[data-symbol]"));
  await Promise.all(
    badges.map(async (badge) => {
      const result = await getRecentPerformance(badge.dataset.symbol, badge.dataset.market);
      const tone = performanceTone(result.pct);
      badge.classList.remove("perf-positive", "perf-negative", "perf-flat", "perf-missing");
      badge.classList.add(`perf-${tone}`);
      badge.dataset.tooltip = result.pct == null
        ? `${badge.textContent}：${result.provider}；點擊開 TradingView`
        : `${badge.textContent}：近 21 個交易日 ${formatPct(result.pct)}，${result.asOf}，${result.provider}；點擊開 TradingView`;
    }),
  );
}

async function hydrateGroupAverages(root = document) {
  const groups = Array.from(root.querySelectorAll(".group-average[data-average-symbols]"));
  await Promise.all(
    groups.map(async (group) => {
      const symbols = group.dataset.averageSymbols.split(",").filter(Boolean).map((item) => {
        const [market, symbol] = item.split(":");
        return { market, symbol };
      });
      const results = await Promise.all(symbols.map((item) => getRecentPerformance(item.symbol, item.market)));
      const valid = results.map((item) => item.pct).filter((pct) => pct != null && !Number.isNaN(pct));
      if (!valid.length) {
        group.textContent = "21日均 --";
        group.dataset.tone = "missing";
        group.title = "近 21 個交易日資料源未連線";
        return;
      }
      const average = valid.reduce((sum, pct) => sum + pct, 0) / valid.length;
      group.textContent = `21日均 ${formatPct(average)}`;
      group.dataset.tone = performanceTone(average);
      group.title = `近 21 個交易日平均，已取得 ${valid.length}/${symbols.length} 檔`;
    }),
  );
}

function stockCard(stock) {
  const events = relatedEvents(stock.ticker);
  const nextEvent = events[0];
  const intel = stockIntel[stock.ticker];
  const research = stockResearchNotes[stock.ticker];
  const sourceLinks = [...(intel?.sources ?? []), ...(research?.sources ?? [])];
  const learningRefs = topicsForStock(stock.ticker);
  return `
    <article class="stock-card" data-theme="${stock.theme}">
      <div class="stock-head">
        <div>
          <h3 class="ticker">${stock.ticker}${research?.ratingPulse ? `<span class="rating-badge">${research.ratingPulse.label}</span>` : ""}</h3>
          <p class="company">${stock.company}</p>
        </div>
        <span class="status">ON</span>
      </div>
      <span class="theme-label">${stock.theme}</span>
      <p class="stock-reason">${stock.watchReason}</p>
      <ul class="focus-list">
        ${stock.focusItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      ${
        intel
          ? `
            <div class="stock-intel">
              <strong>近期資訊</strong>
              <ul>${intel.recent.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            ${
              research?.eventNotes
                ? `
                  <div class="stock-intel event-notes">
                    <strong>論壇 / 法說筆記</strong>
                    <ul>${research.eventNotes.map((item) => `<li>${item}</li>`).join("")}</ul>
                  </div>
                `
                : ""
            }
            <div class="stock-intel market-view">
              <strong>市場 / 機構觀點</strong>
              ${research?.ratingPulse ? `<p class="rating-note"><strong>${research.ratingPulse.label}：</strong>${research.ratingPulse.detail}</p>` : ""}
              <ul>${[...intel.market, ...(research?.marketExpansion ?? [])].map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
          `
          : ""
      }
      <div class="stock-questions">
        <strong>研究問題</strong>
        ${stock.researchQuestions.map((question) => `<p>${question}</p>`).join("")}
      </div>
      <p class="source-line"><strong>近期事件：</strong>${nextEvent ? `${nextEvent.date.slice(5)} ${nextEvent.time} ${nextEvent.title}` : "未放入未來 30 天已確認事件"}</p>
      <p class="source-line"><strong>來源：</strong>${stock.sourcePriority}</p>
      ${
        learningRefs.length
          ? `
            <div class="learning-refs">
              <strong>延伸學習：</strong>
              <div>
                ${learningRefs.map((topic) => `<a href="#learn-${topic.id}">${topic.title}</a>`).join("")}
              </div>
            </div>
          `
          : ""
      }
      ${
        sourceLinks.length
          ? `<div class="stock-links">${sourceLinks.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}</div>`
          : ""
      }
    </article>
  `;
}

function eventItem(event) {
  return `
    <article class="event-item" data-category="${event.category}">
      <div class="event-date">
        <span>${event.date.slice(5)}</span>
        <strong>${event.time}</strong>
      </div>
      <div class="event-body">
        <div class="event-meta">
          ${event.tickers.map((ticker) => `<span class="ticker-pill">${ticker}</span>`).join("")}
          <span class="category-pill">${event.category}</span>
          <span class="confidence-pill">${event.confidence}</span>
        </div>
        <h4>${event.title}</h4>
        <div class="event-section">
          <strong>公告內容摘要</strong>
          <p>${event.announcementSummary}</p>
        </div>
        <div class="event-section">
          <strong>${event.category === "論壇" || event.category === "產品/產業" ? "閱讀重點（保留脈絡）" : "研究閱讀重點"}</strong>
          <ul>
            ${event.readingPoints.map((point) => `<li>${point}</li>`).join("")}
          </ul>
        </div>
        <a href="${event.sourceUrl}" target="_blank" rel="noreferrer">${event.source}</a>
      </div>
    </article>
  `;
}

function learningItem(topic) {
  const externalCount = (topic.extendedTickers?.length ?? 0) + (topic.taiwanTickers?.length ?? 0);
  return `
    <article class="learning-card" id="learn-${topic.id}" data-category="${topic.category}">
      <details>
        <summary class="learning-card-head">
          <span class="learning-summary-main">
            <span class="category-pill">${topic.category}</span>
            <span class="learning-title">${topic.title}</span>
            ${externalCount ? `<span class="external-count">${externalCount} 個延伸標的</span>` : ""}
          </span>
          <span class="ticker-groups">
            ${tickerGroup("主名單", topic.relatedTickers)}
            ${tickerGroup("美股延伸", topic.extendedTickers, "external")}
            ${tickerGroup("台股延伸", topic.taiwanTickers, "taiwan")}
          </span>
        </summary>
        <div class="learning-card-body">
          <div class="learning-block">
            <strong>一句話理解</strong>
            <p>${topic.plain}</p>
          </div>
          <div class="learning-block">
            <strong>為什麼會影響股價</strong>
            <p>${topic.why}</p>
          </div>
          <div class="learning-block">
            <strong>目前瓶頸</strong>
            <ul>${topic.bottlenecks.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
          <div class="learning-block watch-block">
            <strong>可以怎麼追</strong>
            <p>${topic.watch}</p>
          </div>
          <div class="stock-links">
            ${topic.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}
          </div>
        </div>
      </details>
    </article>
  `;
}

function renderEventFilters() {
  eventFilters.innerHTML = eventCategories
    .map(
      (category) => `
        <button class="event-tab ${state.eventCategory === category ? "active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");

  eventFilters.querySelectorAll(".event-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.eventCategory = button.dataset.category;
      renderEvents();
      renderEventFilters();
    });
  });
}

function renderLearningFilters() {
  learningFilters.innerHTML = learningCategories
    .map(
      (category) => `
        <button class="event-tab ${state.learningCategory === category ? "active" : ""}" type="button" data-learning-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");

  learningFilters.querySelectorAll(".event-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.learningCategory = button.dataset.learningCategory;
      renderLearning();
      renderLearningFilters();
    });
  });
}

function formatBriefingTime(value) {
  if (!value) return "待部署";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHttpUrl(value) {
  const text = String(value ?? "");
  return /^https?:\/\//i.test(text) ? text : "";
}

function renderDailyBriefing() {
  const highlights = dailyBriefing.highlights ?? [];
  const summary = dailyBriefing.summary ?? [];
  const stats = dailyBriefing.stats ?? {};
  const asOf = dailyBriefing.asOfDate || "尚未更新";
  const updated = formatBriefingTime(dailyBriefing.generatedAt);
  const mode = dailyBriefing.sourceMode ?? "Fallback static";

  if (briefingAsOf) briefingAsOf.textContent = `資料整理日：${asOf}`;
  if (briefingMetric) briefingMetric.textContent = stats.updatedStocks ? `${stats.updatedStocks} 檔` : "每日";
  if (briefingMode) briefingMode.textContent = mode.includes("public") ? "自動抓取" : "自動更新";
  if (briefingUpdated) briefingUpdated.textContent = updated;
  if (briefingStats) briefingStats.textContent = `新聞 ${stats.newsItems ?? 0} 則 / SEC ${stats.secEvents ?? 0} 筆 / 個股 ${stats.updatedStocks ?? 0} 檔`;
  if (dataStatusText) {
    dataStatusText.textContent = `目前由 GitHub Actions 產生每日資料檔；來源模式：${mode}。公開 SEC filing 與美股漲跌幅會自動更新，研究筆記與學習區會保留人工整理脈絡。`;
  }

  if (!briefingList) return;
  const highlightMarkup = highlights.length
    ? `
      <div class="briefing-priority-list">
        ${highlights.map((item, index) => `
          <article class="briefing-highlight priority-${item.priority === "高" ? "high" : "normal"}">
            <div class="briefing-highlight-top">
              <span class="briefing-rank">${index + 1}</span>
              <span class="briefing-type">${escapeHtml(item.type)}</span>
              <span class="briefing-priority">${escapeHtml(item.priority || "中")}</span>
            </div>
            <h4>${escapeHtml(item.titleZh || item.title)}</h4>
            ${item.titleZh ? `<p class="briefing-original">原標題：${escapeHtml(item.title)}</p>` : ""}
            ${item.tickers?.length ? `<div class="briefing-tickers">${item.tickers.map((ticker) => `<span>${escapeHtml(ticker)}</span>`).join("")}</div>` : ""}
            <p>${escapeHtml(item.why)}</p>
            ${safeHttpUrl(item.sourceUrl) ? `<a href="${escapeHtml(safeHttpUrl(item.sourceUrl))}" target="_blank" rel="noreferrer">${escapeHtml(item.source || "來源")}</a>` : `<span class="briefing-source">${escapeHtml(item.source || "")}</span>`}
          </article>
        `).join("")}
      </div>
    `
    : `<div class="empty-state">今天還沒有抓到可排序的重點新聞；請查看下方資料狀態與個股卡片。</div>`;

  const summaryMarkup = summary.length
    ? `
      <div class="briefing-status-list">
        ${summary.map((item) => `<article class="briefing-card"><p>${escapeHtml(item)}</p></article>`).join("")}
      </div>
    `
    : `<div class="empty-state">每日 briefing 尚未產生，請先執行 GitHub Actions。</div>`;

  briefingList.innerHTML = `
    ${highlightMarkup}
    <div class="briefing-subheading">資料狀態與市場概況</div>
    ${summaryMarkup}
  `;
}

function renderEvents() {
  const events = filteredEvents();
  eventCount.textContent = events.length;
  eventList.innerHTML = events.length
    ? events.map(eventItem).join("")
    : `<div class="empty-state">沒有符合條件的未來事件</div>`;
}

function renderLearning() {
  const topics = filteredLearningTopics();
  learningCount.textContent = topics.length;
  learningList.innerHTML = topics.length
    ? topics.map(learningItem).join("")
    : `<div class="empty-state">沒有符合條件的學習主題。</div>`;
  hydrateTickerPerformance(learningList);
  hydrateGroupAverages(learningList);
}

function renderStocks() {
  const stocks = filteredStocks();
  totalCount.textContent = stocks.length;
  grid.classList.toggle("compact", state.view === "compact");
  grid.innerHTML = stocks.length
    ? stocks.map(stockCard).join("")
    : `<div class="empty-state">沒有符合條件的股票</div>`;
}

function render() {
  renderDailyBriefing();
  renderFilters();
  renderEventFilters();
  renderLearningFilters();
  renderEvents();
  renderLearning();
  renderStocks();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderEvents();
  renderLearning();
  renderStocks();
});

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    toggleButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderStocks();
  });
});

render();
