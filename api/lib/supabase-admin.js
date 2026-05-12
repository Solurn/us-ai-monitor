import { FEATURES, FEATURE_KEYS, normalizePermissions } from "./features.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export function requireServerConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL or VITE_SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY");
  if (missing.length) {
    return { status: 500, payload: { error: `Missing environment variables: ${missing.join(", ")}` } };
  }
  return null;
}

function restUrl(path, params = "") {
  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}${params}`;
}

async function supabaseRest(path, { method = "GET", params = "", body, prefer } = {}) {
  const response = await fetch(restUrl(path, params), {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      ...(prefer ? { prefer } : {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(`Supabase REST ${method} ${path} failed: ${message}`);
  }
  return payload;
}

export async function getAuthUser(request) {
  const header = request.headers?.authorization || request.headers?.get?.("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

export function configuredAdminEmails() {
  return new Set(
    String(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function findMemberByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const rows = await supabaseRest("members", {
    params: `?email=eq.${encodeURIComponent(normalized)}&select=id,email,display_name,role,status,created_at,updated_at&limit=1`,
  });
  return rows?.[0] ?? null;
}

export async function getPermissions(memberId) {
  if (!memberId) return normalizePermissions([]);
  const rows = await supabaseRest("member_permissions", {
    params: `?member_id=eq.${encodeURIComponent(memberId)}&select=feature_key,enabled`,
  });
  return normalizePermissions(rows);
}

export async function requireActiveMember(request) {
  const configError = requireServerConfig();
  if (configError) return { response: configError };

  const user = await getAuthUser(request);
  const email = user?.email?.toLowerCase();
  if (!email) {
    return { response: { status: 401, payload: { error: "Please sign in first." } } };
  }

  const member = await findMemberByEmail(email);
  if (!member || member.status !== "active") {
    return {
      response: { status: 403, payload: {
        error: "This email is not active on the whitelist.",
        email,
        status: member?.status || "not_found",
      } },
    };
  }

  const permissions = await getPermissions(member.id);
  const isAdmin = member.role === "admin" || configuredAdminEmails().has(email);
  return { user, member, permissions, isAdmin };
}

export async function requireAdmin(request) {
  const auth = await requireActiveMember(request);
  if (auth.response) return auth;
  if (!auth.isAdmin) {
    return { response: { status: 403, payload: { error: "Admin access required." } } };
  }
  return auth;
}

export async function listMembers() {
  const members = await supabaseRest("members", {
    params: "?select=id,email,display_name,role,status,created_at,updated_at&order=email.asc",
  });
  const permissions = await supabaseRest("member_permissions", {
    params: "?select=member_id,feature_key,enabled",
  });
  const byMember = new Map();
  for (const row of permissions ?? []) {
    if (!byMember.has(row.member_id)) byMember.set(row.member_id, []);
    byMember.get(row.member_id).push(row);
  }
  return members.map((member) => ({
    ...member,
    permissions: normalizePermissions(byMember.get(member.id) ?? []),
  }));
}

export async function upsertMember({ email, display_name = "", role = "member", status = "active" }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Valid email is required.");
  const cleanRole = role === "admin" ? "admin" : "member";
  const cleanStatus = status === "inactive" ? "inactive" : "active";
  const rows = await supabaseRest("members", {
    method: "POST",
    params: "?on_conflict=email&select=id,email,display_name,role,status,created_at,updated_at",
    prefer: "resolution=merge-duplicates,return=representation",
    body: {
      email: cleanEmail,
      display_name: String(display_name || "").trim(),
      role: cleanRole,
      status: cleanStatus,
      updated_at: new Date().toISOString(),
    },
  });
  return rows?.[0];
}

export async function updateMember({ id, display_name, role, status }) {
  if (!id) throw new Error("Member id is required.");
  const patch = { updated_at: new Date().toISOString() };
  if (display_name != null) patch.display_name = String(display_name || "").trim();
  if (role != null) patch.role = role === "admin" ? "admin" : "member";
  if (status != null) patch.status = status === "inactive" ? "inactive" : "active";
  const rows = await supabaseRest("members", {
    method: "PATCH",
    params: `?id=eq.${encodeURIComponent(id)}&select=id,email,display_name,role,status,created_at,updated_at`,
    prefer: "return=representation",
    body: patch,
  });
  return rows?.[0];
}

export async function replacePermissions(memberId, permissions = {}) {
  if (!memberId) throw new Error("Member id is required.");
  await supabaseRest("member_permissions", {
    method: "DELETE",
    params: `?member_id=eq.${encodeURIComponent(memberId)}`,
  });
  const rows = FEATURES.map((feature) => ({
    member_id: memberId,
    feature_key: feature.key,
    enabled: Boolean(permissions[feature.key]),
  })).filter((row) => FEATURE_KEYS.has(row.feature_key));
  if (!rows.length) return [];
  return supabaseRest("member_permissions", {
    method: "POST",
    prefer: "return=representation",
    body: rows,
  });
}

export async function writeAuditLog(adminEmail, action, targetEmail, payload = {}) {
  return supabaseRest("audit_logs", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      admin_email: String(adminEmail || "").toLowerCase(),
      action,
      target_email: String(targetEmail || "").toLowerCase(),
      payload,
    },
  });
}
