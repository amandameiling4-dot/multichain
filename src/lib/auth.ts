import { NextRequest } from "next/server";
import { createHmac } from "crypto";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable must be set in production");
    }
    return "dev-secret-not-for-production";
  }
  return secret;
}

const SESSION_COOKIE = "mc_session";

// ─── Admin API-key auth ───────────────────────────────────────────────────────

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

// ─── Session cookie auth ──────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  walletAddress: string;
  role: string;
}

/** Sign a session token using HMAC-SHA256. */
export function signSession(payload: SessionPayload): string {
  const secret = getSessionSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

/** Parse and verify a session token. Returns null if invalid. */
export function verifySession(token: string): SessionPayload | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const data = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const secret = getSessionSecret();
    const expectedSig = createHmac("sha256", secret).update(data).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    return payload;
  } catch {
    return null;
  }
}

/** Get the current session from request cookies. */
export function getSession(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Build a Set-Cookie header value for the session. */
export function buildSessionCookie(payload: SessionPayload, maxAge = 7 * 24 * 60 * 60): string {
  const token = signSession(payload);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Build a cookie header that clears the session. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "SUPPORT" | "OPS_ADMIN" | "SUPER_ADMIN";

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  SUPPORT: 1,
  OPS_ADMIN: 2,
  SUPER_ADMIN: 3,
};

/** Returns true if the session role is >= the required role. */
export function hasRole(session: SessionPayload | null, required: UserRole): boolean {
  if (!session) return false;
  const rank = ROLE_RANK[session.role as UserRole] ?? 0;
  return rank >= ROLE_RANK[required];
}

/** Return a 403 Forbidden response body. */
export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
