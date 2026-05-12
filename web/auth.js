(async () => {
  const authRoot = document.querySelector("#authRoot");
  const appShell = document.querySelector("#appShell");
  let client = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function card(title, body, actions = "") {
    authRoot.hidden = false;
    authRoot.innerHTML = `
      <section class="auth-card">
        <p class="eyebrow">Private Dashboard</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${body}</p>
        ${actions ? `<div class="auth-actions">${actions}</div>` : ""}
      </section>
    `;
  }

  async function api(path, session, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {}),
      },
    });
    const payload = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : await response.text();
    if (!response.ok) {
      throw Object.assign(new Error(payload?.error || response.statusText), {
        status: response.status,
        payload,
      });
    }
    return payload;
  }

  async function loadConfig() {
    const response = await fetch("/api/config", { cache: "no-store" });
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || "Supabase config is not available.");
    if (!window.supabase?.createClient) throw new Error("Supabase client script did not load.");
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async function signIn() {
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }

  async function signOut() {
    await client.auth.signOut();
    window.location.reload();
  }

  function installSessionBar(sessionInfo) {
    const bar = document.createElement("div");
    bar.className = "session-bar";
    bar.innerHTML = `
      <span>${escapeHtml(sessionInfo.member.email)}</span>
      ${sessionInfo.isAdmin ? `<a href="/admin">管理者頁面</a>` : ""}
      <button type="button" id="signOutButton">登出</button>
    `;
    document.body.prepend(bar);
    bar.querySelector("#signOutButton")?.addEventListener("click", signOut);
  }

  function assignDashboardData(data) {
    for (const [key, value] of Object.entries(data || {})) {
      window[key] = value;
    }
  }

  async function runPrivateApp(session, sessionInfo) {
    const payload = await api("/api/dashboard-data", session);
    window.dashboardPermissions = payload.permissions || {};
    window.dashboardMember = sessionInfo.member;
    assignDashboardData(payload.data);

    const bundleResponse = await fetch("/api/app-bundle", {
      headers: { authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const bundle = await bundleResponse.text();
    if (!bundleResponse.ok) throw new Error(bundle || "Private app bundle is not available.");

    authRoot.hidden = true;
    appShell.hidden = false;
    installSessionBar(sessionInfo);

    const script = document.createElement("script");
    script.textContent = bundle;
    document.body.appendChild(script);
  }

  async function boot() {
    card("登入中", "正在檢查你的登入狀態與白名單權限。");
    await loadConfig();
    const { data } = await client.auth.getSession();
    const session = data.session;

    if (!session) {
      card(
        "美股 AI 監測白名單",
        "請使用已加入白名單的 Google 帳號登入。",
        `<button type="button" id="googleLoginButton">使用 Google 登入</button>`,
      );
      authRoot.querySelector("#googleLoginButton")?.addEventListener("click", () => {
        signIn().catch((error) => card("登入失敗", escapeHtml(error.message)));
      });
      return;
    }

    let sessionInfo;
    try {
      sessionInfo = await api("/api/session", session);
    } catch (error) {
      const email = error.payload?.email ? `<br><strong>${escapeHtml(error.payload.email)}</strong>` : "";
      card("尚未開通", `這個 Google 帳號不在有效白名單內。${email}`, `<button type="button" id="signOutButton">換一個帳號</button>`);
      authRoot.querySelector("#signOutButton")?.addEventListener("click", signOut);
      return;
    }

    if (!Object.values(sessionInfo.permissions || {}).some(Boolean)) {
      card("尚未分配功能", "你的信箱已在白名單內，但管理者尚未勾選可觀看的功能。", `<button type="button" id="signOutButton">登出</button>`);
      authRoot.querySelector("#signOutButton")?.addEventListener("click", signOut);
      return;
    }

    await runPrivateApp(session, sessionInfo);
  }

  boot().catch((error) => {
    card("系統設定尚未完成", escapeHtml(error.message || "請確認 Vercel/Supabase 環境變數。"));
  });
})();
