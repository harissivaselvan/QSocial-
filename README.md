# QSocial

QSocial is an anonymous, ephemeral social platform. Posts are designed to disappear after 7 days.

## Stack

- Next.js + React + TypeScript
- Clerk authentication
- Supabase PostgreSQL
- Cloudflare R2
- browser-image-compression
- Upstash QStash (expiration scheduling)
- Optional UploadThing

## Important

This repository is a functional foundation, not a claim that every production integration is configured. Before public deployment, configure QStash signature verification, R2 public/private delivery, rate limiting, moderation, and automated cleanup.

## Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Create Clerk, Supabase and Cloudflare R2 projects.
4. Run `database/schema.sql` in Supabase.
5. Configure R2 credentials.
6. Run `npm install`.
7. Run `npm run dev`.

## R2

Use a private bucket. Prefer signed/authorized media delivery rather than exposing the bucket directly.

## QStash

When enabled, schedule `/api/internal/expire-post` at each post's `expires_at`. Verify QStash signatures using the current Upstash SDK before allowing the endpoint in production.

## Cleanup

QStash provides precise expiration. PostgreSQL scheduled cleanup is a backup. R2 lifecycle rules should also be configured as a safety net.

## Production checklist

- [ ] QStash signature verification
- [ ] Rate limiting
- [ ] Moderation/reporting
- [ ] Private R2 bucket + signed delivery
- [ ] Strict upload MIME/content validation
- [ ] Cursor pagination
- [ ] Security headers
- [ ] Error monitoring without logging post content
- [ ] Supabase scheduled cleanup
- [ ] Privacy policy and retention disclosure
- [ ] Current provider free-tier limits verified
