(async () => {
  const status = document.querySelector("#adminStatus");
  const editor = document.querySelector("#memberEditor");
  const panel = document.querySelector("#membersPanel");
  const table = document.querySelector("#membersTable");
  const form = document.querySelector("#memberForm");
  let client = null;
  let session = null;
  let features = [];
  let members = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function setStatus(message, tone = "") {
    status.textContent = message;
    status.dataset.tone = tone;
  }

  async function loadConfig() {
    const response = await fetch("/api/config", { cache: "no-store" });
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || "Supabase config is not available.");
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || response.statusText);
    return payload;
  }

  async function refresh() {
    const payload = await api("/api/admin-members");
    features = payload.features || [];
    members = payload.members || [];
    render();
  }

  function featureCells(member) {
    return features.map((feature) => `
      <label class="permission-check">
        <input type="checkbox" data-member="${member.id}" data-feature="${feature.key}" ${member.permissions?.[feature.key] ? "checked" : ""} />
        <span>${escapeHtml(feature.label)}</span>
      </label>
    `).join("");
  }

  function render() {
    editor.hidden = false;
    panel.hidden = false;
    setStatus(`已載入 ${members.length} 位白名單成員。`, "ok");
    table.innerHTML = `
      <div class="members-list">
        ${members.map((member) => `
          <article class="member-row" data-member-row="${member.id}">
            <div class="member-main">
              <strong>${escapeHtml(member.email)}</strong>
              <input data-field="display_name" value="${escapeHtml(member.display_name || "")}" placeholder="顯示名稱" />
              <select data-field="role">
                <option value="member" ${member.role === "member" ? "selected" : ""}>member</option>
                <option value="admin" ${member.role === "admin" ? "selected" : ""}>admin</option>
              </select>
              <select data-field="status">
                <option value="active" ${member.status === "active" ? "selected" : ""}>active</option>
                <option value="inactive" ${member.status === "inactive" ? "selected" : ""}>inactive</option>
              </select>
              <button type="button" data-save="${member.id}">更新</button>
            </div>
            <div class="permissions-grid">${featureCells(member)}</div>
          </article>
        `).join("") || `<p class="empty-state">尚未建立白名單成員。</p>`}
      </div>
    `;
  }

  async function saveMember(id) {
    const row = table.querySelector(`[data-member-row="${id}"]`);
    const member = members.find((item) => item.id === id);
    const permissions = {};
    row.querySelectorAll("[data-feature]").forEach((input) => {
      permissions[input.dataset.feature] = input.checked;
    });
    await api("/api/admin-members", {
      method: "PATCH",
      body: JSON.stringify({
        id,
        display_name: row.querySelector('[data-field="display_name"]').value,
        role: row.querySelector('[data-field="role"]').value,
        status: row.querySelector('[data-field="status"]').value,
        permissions,
      }),
    });
    setStatus(`已更新 ${member.email}。`, "ok");
    await refresh();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    await api("/api/admin-members", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    form.reset();
    setStatus("會員已儲存。", "ok");
    await refresh();
  });

  table.addEventListener("click", (event) => {
    const id = event.target?.dataset?.save;
    if (!id) return;
    saveMember(id).catch((error) => setStatus(error.message, "error"));
  });

  async function boot() {
    await loadConfig();
    const { data } = await client.auth.getSession();
    session = data.session;
    if (!session) {
      setStatus("請先回首頁用管理者 Google 帳號登入。", "error");
      return;
    }
    const sessionInfo = await api("/api/session");
    if (!sessionInfo.isAdmin) {
      setStatus("這個帳號沒有管理者權限。", "error");
      return;
    }
    await refresh();
  }

  boot().catch((error) => setStatus(error.message, "error"));
})();
