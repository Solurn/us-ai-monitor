import { sendJson } from "./lib/http.js";
import { privateAssetContentType, readPrivateAsset } from "./lib/data-store.js";
import { FEATURE_KEYS } from "./lib/features.js";
import { requireActiveMember } from "./lib/supabase-admin.js";

export default async function handler(request, response) {
  const auth = await requireActiveMember(request);
  if (auth.response) return sendJson(response, auth.response.status, auth.response.payload);

  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const feature = url.searchParams.get("feature") || "";
  const assetPath = url.searchParams.get("path") || "";
  if (!FEATURE_KEYS.has(feature) || !auth.permissions[feature]) {
    return sendJson(response, 403, { error: "This asset is not available for this member." });
  }

  const bytes = await readPrivateAsset(assetPath);
  if (!bytes) return sendJson(response, 404, { error: "Asset not found." });

  response.statusCode = 200;
  response.setHeader("content-type", privateAssetContentType(assetPath));
  response.setHeader("cache-control", "private, no-store");
  response.end(bytes);
}
