import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';
import arcjet, { fixedWindow, shield } from '@arcjet/next';

// Initialize Arcjet for auth endpoints with stricter rate limiting
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Strict rate limiting for auth endpoints to prevent brute force attacks
    fixedWindow({
      mode: 'LIVE', // Use "DRY_RUN" for testing
      window: '15m', // 15 minute window
      max: 20, // Maximum 20 auth attempts per IP per 15 minutes
    }),

    // Shield WAF to protect against injection attacks on auth forms
    shield({
      mode: 'LIVE',
    }),
  ],
});

// Get the original handlers from Better Auth
const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth.handler);

// Wrap GET handler with rate limiting
export async function GET(request: NextRequest) {
  try {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        console.log(`Auth rate limited: ${decision.ip}`);
        return NextResponse.json(
          {
            error: 'Too many authentication requests. Please try again later.',
            retryAfter: 900, // 15 minutes in seconds
          },
          {
            status: 429,
            headers: { 'Retry-After': '900' },
          }
        );
      }

      if (decision.reason.isShield()) {
        console.log(`Auth attack blocked: ${decision.ip}`);
        return NextResponse.json(
          { error: 'Suspicious request detected' },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: 'Request blocked' }, { status: 403 });
    }
  } catch (error) {
    // If Arcjet fails, log and continue (fail open)
    console.warn('Arcjet error in auth GET:', error);
  }

  // Call the original Better Auth GET handler
  return originalGET(request);
}

// Wrap POST handler with rate limiting (more critical for login/signup)
export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        console.log(`Auth POST rate limited: ${decision.ip}`);
        return NextResponse.json(
          {
            error: 'Too many authentication attempts. Please try again later.',
            retryAfter: 900, // 15 minutes in seconds
          },
          {
            status: 429,
            headers: { 'Retry-After': '900' },
          }
        );
      }

      if (decision.reason.isShield()) {
        console.log(`Auth POST attack blocked: ${decision.ip}`);
        return NextResponse.json(
          { error: 'Suspicious request detected' },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: 'Request blocked' }, { status: 403 });
    }
  } catch (error) {
    // If Arcjet fails, log and continue (fail open)
    console.warn('Arcjet error in auth POST:', error);
  }

  // Call the original Better Auth POST handler
  return originalPOST(request);
}
