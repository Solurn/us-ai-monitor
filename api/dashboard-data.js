import { sendJson } from "./lib/http.js";
import { readDashboardData } from "./lib/data-store.js";
import { requireActiveMember } from "./lib/supabase-admin.js";

export default async function handler(request, response) {
  const auth = await requireActiveMember(request);
  if (auth.response) return sendJson(response, auth.response.status, auth.response.payload);

  const data = await readDashboardData(auth.permissions);
  return sendJson(response, 200, {
    permissions: auth.permissions,
    data,
  });
}
