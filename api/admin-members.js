import { FEATURES } from "./lib/features.js";
import { sendJson, sendMethodNotAllowed, readJsonBody } from "./lib/http.js";
import {
  listMembers,
  replacePermissions,
  requireAdmin,
  updateMember,
  upsertMember,
  writeAuditLog,
} from "./lib/supabase-admin.js";

export default async function handler(request, response) {
  const auth = await requireAdmin(request);
  if (auth.response) return sendJson(response, auth.response.status, auth.response.payload);

  if (request.method === "GET") {
    return sendJson(response, 200, {
      features: FEATURES,
      members: await listMembers(),
    });
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);
    const member = await upsertMember(body);
    if (body.permissions) await replacePermissions(member.id, body.permissions);
    await writeAuditLog(auth.member.email, "member_upsert", member.email, body);
    return sendJson(response, 200, {
      features: FEATURES,
      members: await listMembers(),
    });
  }

  if (request.method === "PATCH") {
    const body = await readJsonBody(request);
    const member = await updateMember(body);
    if (body.permissions) await replacePermissions(member.id, body.permissions);
    await writeAuditLog(auth.member.email, "member_update", member.email, body);
    return sendJson(response, 200, {
      features: FEATURES,
      members: await listMembers(),
    });
  }

  return sendMethodNotAllowed(response, ["GET", "POST", "PATCH"]);
}
