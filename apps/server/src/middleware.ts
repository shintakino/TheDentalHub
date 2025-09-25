import { NextResponse, NextRequest } from 'next/server';
import arcjet, { detectBot, fixedWindow, shield } from '@arcjet/next';

// Initialize Arcjet with all free tier features
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your free key from https://app.arcjet.com
  rules: [
    // Bot detection - detect and block automated clients
    detectBot({
      mode: 'LIVE', // Use "DRY_RUN" for testing
      allow: [
        // Optionally allow search engine crawlers for SEO
        // "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
        // "CATEGORY:MONITOR", // Uptime monitoring services
        // "CATEGORY:PREVIEW", // Link previews (Slack, Discord, etc.)
      ],
    }),

    // Rate limiting - prevent abuse and implement usage quotas
    fixedWindow({
      mode: 'LIVE', // Use "DRY_RUN" for testing
      window: '1m', // 1 minute window
      max: 100, // Maximum 100 requests per minute per IP
    }),

    // Shield WAF - protect against common attacks
    shield({
      mode: 'LIVE', // Use "DRY_RUN" for testing
      // Automatically protects against:
      // - SQL injection
      // - Cross-site scripting (XSS)
      // - Directory traversal
      // - Command injection
      // - And other common attacks
    }),
  ],
});

export async function middleware(request: NextRequest) {
  // Skip protection for auth endpoints to avoid conflicts with Better Auth
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    // Continue with original CORS logic for auth endpoints
    const res = NextResponse.next();

    res.headers.append('Access-Control-Allow-Credentials', 'true');
    res.headers.append(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN || ''
    );
    res.headers.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.headers.append(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return res;
  }

  // Get Arcjet security decision for all other routes
  const decision = await aj.protect(request);

  // Handle different types of blocks
  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      console.log(
        `Bot blocked: ${decision.ip} - ${request.headers.get('user-agent')}`
      );
      return new NextResponse('Access Denied', {
        status: 403,
      });
    }

    if (decision.reason.isRateLimit()) {
      console.log(`Rate limited: ${decision.ip}`);
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60', // Tell client when to retry
        },
      });
    }

    if (decision.reason.isShield()) {
      console.log(`Attack blocked by Shield: ${decision.ip}`);
      return new NextResponse('Suspicious Request Detected', {
        status: 403,
      });
    }

    // Generic denial
    return new NextResponse('Access Denied', {
      status: 403,
    });
  }

  // Log any errors (but don't block - fail open)
  if (decision.isErrored()) {
    console.warn('Arcjet error:', decision.reason);
    // Continue to allow the request through
  }

  // Continue with original CORS logic
  const res = NextResponse.next();

  res.headers.append('Access-Control-Allow-Credentials', 'true');
  res.headers.append(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || ''
  );
  res.headers.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.append(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  return res;
}

export const config = {
  matcher: '/:path*',
};
