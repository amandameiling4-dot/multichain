/**
 * CORS utility for mobile / React Native clients.
 *
 * Usage in an API route:
 *
 *   import { corsHeaders, handlePreflight } from "@/lib/cors";
 *
 *   export async function OPTIONS() {
 *     return handlePreflight();
 *   }
 *
 *   export async function GET(request: Request) {
 *     const data = await fetchSomething();
 *     return Response.json(data, { headers: corsHeaders });
 *   }
 */

/** Allowed origins. "*" permits React Native / mobile clients. */
const ALLOW_ORIGIN = process.env.CORS_ORIGIN ?? "*";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/** Respond to an OPTIONS pre-flight request. */
export function handlePreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/** Wrap an existing Response to add CORS headers. */
export function withCors(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders)) {
    newHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
