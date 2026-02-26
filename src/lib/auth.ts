import { NextRequest } from "next/server";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * Validate admin API key from the Authorization header.
 * Returns true if valid, false otherwise.
 */
export function validateAdminKey(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const [scheme, token] = authHeader.split(" ");
  return scheme === "Bearer" && token === ADMIN_API_KEY;
}

/**
 * Return a 401 Unauthorized response body.
 */
export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
