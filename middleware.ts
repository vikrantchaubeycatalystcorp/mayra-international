import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, sliding window)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/admin/auth/login": { windowMs: 15 * 60 * 1000, max: 20 },
  "/api/enquiry": { windowMs: 60 * 1000, max: 5 },
  "/api/free-counselling": { windowMs: 60 * 1000, max: 5 },
  "/api/newsletter": { windowMs: 60 * 1000, max: 3 },
  "/api/search": { windowMs: 10 * 1000, max: 30 },
  "/api/ai/parse-resume": { windowMs: 60 * 1000, max: 5 },
  "/api/ai/generate-summary": { windowMs: 60 * 1000, max: 10 },
  "/api/ai/improve-bullet": { windowMs: 60 * 1000, max: 20 },
  "/api/ai/parse-jd": { windowMs: 60 * 1000, max: 10 },
  "/api/ai/score-resume": { windowMs: 60 * 1000, max: 10 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > max;
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { _rlCleanup?: NodeJS.Timeout };
  if (!g._rlCleanup) {
    g._rlCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt) rateLimitMap.delete(key);
      }
    }, 5 * 60 * 1000);
  }
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ---------------------------------------------------------------------------
// Admin auth verification (defense-in-depth)
// ---------------------------------------------------------------------------

const PUBLIC_ADMIN_PATHS = ["/api/admin/auth/login"];

async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rate limiting on specific endpoints (POST only for form endpoints)
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname === path) {
      const isFormEndpoint = ["/api/enquiry", "/api/free-counselling", "/api/newsletter"].includes(path);
      if (isFormEndpoint && req.method !== "POST") break;

      const ip = getClientIp(req);
      const key = `${ip}:${path}`;

      if (isRateLimited(key, config.windowMs, config.max)) {
        return applySecurityHeaders(
          NextResponse.json(
            {
              success: false,
              error: {
                code: "RATE_LIMITED",
                message: "Too many requests. Please try again later.",
              },
            },
            { status: 429 }
          )
        );
      }
      break;
    }
  }

  // 2. Defense-in-depth: verify admin JWT for all /api/admin/* routes
  //    (individual handlers also check, this is an extra layer)
  if (
    pathname.startsWith("/api/admin") &&
    !PUBLIC_ADMIN_PATHS.includes(pathname)
  ) {
    const isAuthenticated = await verifyAdminToken(req);
    if (!isAuthenticated) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Not authenticated" },
          },
          { status: 401 }
        )
      );
    }
  }

  // 3. Apply security headers to all responses
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
