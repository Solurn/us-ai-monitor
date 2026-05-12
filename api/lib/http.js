export function sendJson(response, status, payload, headers = {}) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value);
  }
  response.end(JSON.stringify(payload));
}

export function sendMethodNotAllowed(response, methods) {
  return sendJson(response, 405, { error: `Method must be one of: ${methods.join(", ")}` }, {
    allow: methods.join(", "),
  });
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}
