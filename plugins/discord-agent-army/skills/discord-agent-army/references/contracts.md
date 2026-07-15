# Contract model

Each community owns one `community.contract.json` and one local `.env`.

## Community contract

- `tenant`: stable slug and display name.
- `discord`: application and guild identifiers; never include tokens.
- `runtime`: isolated process now; shared workers later.
- `agents`: explicit capability and autonomy declarations.
- `approvals`: actions that require human confirmation.
- `data`: retention and training boundaries.

## Default agents

| Agent | Autonomy | Boundary |
|---|---|---|
| Architect | approval_required | Plans structure; applies only after confirmation |
| Welcome | automatic | Public greeting; no DMs by default |
| Guide | automatic | Approved FAQs and routing only |
| Support | automatic | Opens tickets; escalates uncertainty |
| News Scout | approval_required | Simulations automatic; live claims require review |
| Hype | approval_required | No unsolicited or repeated mentions |
| Moderation Triage | recommend_only | No autonomous bans or appeals |

Add capabilities narrowly. An agent contract never grants Discord permissions by itself; the bot role and policy layer must both permit an action.
