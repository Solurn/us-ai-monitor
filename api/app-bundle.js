import fs from "node:fs/promises";
import path from "node:path";
import { sendJson } from "./lib/http.js";
import { requireActiveMember } from "./lib/supabase-admin.js";

export default async function handler(request, response) {
  const auth = await requireActiveMember(request);
  if (auth.response) return sendJson(response, auth.response.status, auth.response.payload);

  const source = await fs.readFile(path.join(process.cwd(), "api", "_private", "app.js"), "utf8");
  response.statusCode = 200;
  response.setHeader("content-type", "application/javascript; charset=utf-8");
  response.setHeader("cache-control", "private, no-store");
  response.end(source);
}
