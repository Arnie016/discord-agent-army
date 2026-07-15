---
name: discord-agent-army
description: Scaffold, configure, validate, and operate multiple Discord communities using isolated bot instances, reusable agent contracts, dry-run provisioning, and human approval gates. Use for multi-server Discord hosting, tenant/community setup, agent team configuration, fleet health checks, simulations, or scaling a single Discord bot into a managed community fleet.
---

# Discord Agent Army

Use the bundled community template and fleet scripts. Keep every AI identity visibly labeled as a bot. Never automate normal Discord user accounts. Refuse requests to impersonate humans, manufacture fake engagement, spam, evade Discord controls, or expose credentials.

## Create a community instance

From the plugin root, run:

```bash
node scripts/scaffold-community.mjs \
  --slug <tenant-slug> \
  --name "<Community Name>" \
  --guild-id <discord-guild-id> \
  --client-id <discord-application-id> \
  --output <fleet-root>/<tenant-slug>
```

Place the bot token only in the generated `.env`; never echo or paste it into chat. Install dependencies inside the instance and run `npm test` plus `npm run doctor`.

## Operate a fleet

Use `node scripts/fleet.mjs <command> --root <fleet-root>`:

- `list`: enumerate contracts and credential readiness.
- `doctor`: validate contracts, isolation, config, and dependency state.
- `plan`: run read-only provisioning plans.
- `apply --slug <slug> --confirm <guild-id>`: apply one approved plan.
- `start --slug <slug>`: run one isolated community worker in the foreground.

Before `apply`, show the exact guild, roles, channels, and commands and request explicit approval. Never bulk-apply multiple guilds.

## Agent contract rules

- `automatic`: greetings, FAQ lookup, simulations, interest self-assignment.
- `approval_required`: hype announcements, live news, structural changes.
- `recommend_only`: moderation decisions, bans, appeals, policy changes.
- `human_only`: verification decisions, credential rotation, ownership changes.

Do not expand punitive moderation beyond `recommend_only`. Require a human to approve bans, kicks, timeouts, appeals, sensitive verification, or ambiguous enforcement. Test content must be labeled as a simulation and include a cleanup path.

Use the contracts in `../../contracts/`. Read `references/contracts.md` when adding agents or permissions. Read `references/scale-path.md` when moving beyond isolated workers.

## Completion proof

Report the instance path, contract slug, guild ID, dry-run output, test result, and whether the worker is actually online. Treat browser state as routing context, not runtime proof.
