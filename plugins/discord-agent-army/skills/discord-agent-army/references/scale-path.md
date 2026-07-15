# Scale path

## Phase 1: isolated workers

Run one generated directory and process per community. This gives simple token, configuration, log, and failure isolation. Use a process supervisor for persistence.

## Phase 2: managed fleet

Move contracts to Postgres, jobs to Redis or a durable queue, and bot tokens to KMS-backed secret storage. Route every event by tenant and guild ID. Preserve per-tenant rate limits and audit logs.

## Phase 3: hosted control plane

Add OAuth installation, tenant authentication, encrypted bring-your-own-bot credentials, usage quotas, billing, regional workers, deletion/export controls, and an approval inbox. Keep Discord actions idempotent and never grant workers global Administrator permission.

Do not place tokens in contracts, databases without envelope encryption, logs, analytics, prompts, or support tickets.
