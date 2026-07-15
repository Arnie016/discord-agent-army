# Discord Agent Army

A public Codex plugin for scaffolding and operating multiple Discord communities with isolated bot credentials, declarative contracts, dry-run provisioning, and human approval gates.

It includes reusable support-ticket, FAQ, human-verification, interest-role, welcome, scheduled-news, and simulation modules. Agents are always disclosed as bots. The plugin does not create self-bots, impersonate humans, or bypass Discord controls.

## Install in Codex

```bash
codex plugin marketplace add Arnie016/discord-agent-army
codex plugin add discord-agent-army@discord-agent-army
```

Restart Codex after installing. Then try:

- `Scaffold a Discord community with the default agent army.`
- `Show the dry-run plan for all managed Discord servers.`
- `Add a contract-governed support agent with human escalation.`

## What it creates

Each community is an isolated Node.js Discord application with:

- declarative server and agent contracts;
- least-privilege roles and channels;
- FAQ-first support tickets with human escalation;
- human-reviewed verification;
- opt-in interest roles and disclosed automated welcomes;
- simulation-only example activity that is labeled and removable;
- a fleet CLI for validation, dry runs, and multi-instance operation.

## Safety contract

- Use official Discord bot accounts only—never user-account automation.
- Disclose automation and AI-generated responses.
- Keep bans, kicks, timeouts, role elevation, and ambiguous moderation human-approved.
- Never put Discord or OpenAI secrets in contracts, prompts, commits, or logs.
- Respect rate limits, member consent, Discord rules, and applicable law.
- Do not manufacture fake engagement or present simulated activity as real people.

## Local development

```bash
cd plugins/discord-agent-army
npm test
npm run check
node scripts/scaffold-community.mjs --name test-community --output /tmp/test-community
```

The generated project keeps its token in a local `.env`. Start with `npm run doctor` and `npm run provision:dry` before making changes to a server.

## Project policies

See [Privacy](PRIVACY.md), [Terms](TERMS.md), [Support](SUPPORT.md), and [Security](SECURITY.md).

Discord Agent Army is an independent open-source project and is not affiliated with or endorsed by Discord or OpenAI.
