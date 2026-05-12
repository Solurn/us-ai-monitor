import { FEATURES } from "./lib/features.js";
import { sendJson } from "./lib/http.js";
import { requireActiveMember } from "./lib/supabase-admin.js";

export default async function handler(request, response) {
  const auth = await requireActiveMember(request);
  if (auth.response) return sendJson(response, auth.response.status, auth.response.payload);

  return sendJson(response, 200, {
    member: {
      email: auth.member.email,
      display_name: auth.member.display_name,
      role: auth.member.role,
      status: auth.member.status,
    },
    permissions: auth.permissions,
    isAdmin: auth.isAdmin,
    features: FEATURES,
  });
}
