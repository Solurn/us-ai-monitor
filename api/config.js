import { sendJson } from "./lib/http.js";

export default async function handler(request, response) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return sendJson(response, 500, {
      error: "Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    });
  }

  return sendJson(response, 200, {
    supabaseUrl,
    supabaseAnonKey,
  });
}
