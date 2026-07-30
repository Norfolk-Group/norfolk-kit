# 0002 — Presigned direct uploads; file bytes never traverse the server

Date: 2026-07-29
Status: Accepted

## Decision

Clients upload straight to Cloudflare R2 (or Stream, for video) using a short-lived presigned grant. The server's only roles are (a) authorising the request and minting the grant, and (b) recording metadata afterwards. Downloads mirror this: the server returns a signed, expiring URL and the client fetches from Cloudflare directly.

Flow:
1. Client calls a tRPC procedure asking for an upload grant.
2. Server checks permissions, enforces the size limit, mints a presigned URL.
3. Client uploads directly to Cloudflare.
4. Client confirms; server records metadata in Postgres.

## Why

A large upload through a request handler occupies a worker for minutes, so hosting cost and reliability degrade with media weight rather than with user count. A 300 MB file through `multer` on a single Railway instance is an outage waiting for a busy afternoon. Keeping bytes out of the server makes compute cost flat regardless of how heavy the media gets.

## Implementation constraints — all non-optional

- **R2 requires `forcePathStyle: true`** on the S3 client, with `region: "auto"`. The AWS SDK v3 defaults to virtual-hosted-style URLs (`bucket.account.r2.cloudflarestorage.com/key`); R2 serves path-style (`account.r2.cloudflarestorage.com/bucket/key`) and returns **403 Forbidden** on presigned GETs without it. This cost real debugging time on the Obra Pía migration — the files were present and the credentials correct, and every request still failed.
- **Size limits are enforced at grant issuance**, server-side, in one place. Not scattered across client-side checks that a direct API call bypasses.
- **Video above ~200 MB uses tus resumable upload**, not Stream's simple direct POST. Resumability is also the difference between a recoverable and a wasted upload on hotel Wi-Fi.
- **Presigned URLs are short-lived** (≈1 hour) and responses carry `Cache-Control: no-store`, so a signed URL never lands in a shared cache.

## What this rules out

- `multer`, `body-parser` file handling, or any streaming-through-Express upload route. Do not reintroduce them.
- Serving files by reading them server-side and piping the response.
- Public buckets for anything access-controlled. Gated content is always signed and expiring.
- Removing `forcePathStyle` as "cleanup." It looks redundant. It is not.

## Reversal conditions

Only on a move off S3-compatible storage entirely.
