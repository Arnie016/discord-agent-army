import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

export function defaultAgents() {
  return [
    { id: "architect", displayName: "Architect Agent", autonomy: "approval_required", capabilities: ["guild.plan", "guild.provision"] },
    { id: "welcome", displayName: "Welcome Agent", autonomy: "automatic", capabilities: ["member.welcome"] },
    { id: "guide", displayName: "Guide Agent", autonomy: "automatic", capabilities: ["faq.answer", "member.route"] },
    { id: "support", displayName: "Support Agent", autonomy: "automatic", capabilities: ["ticket.open", "ticket.escalate"] },
    { id: "news-scout", displayName: "News Scout", autonomy: "approval_required", capabilities: ["news.simulate", "news.propose"] },
    { id: "hype", displayName: "Hype Agent", autonomy: "approval_required", capabilities: ["announcement.propose"] },
    { id: "moderation-triage", displayName: "Moderation Triage", autonomy: "recommend_only", capabilities: ["moderation.classify", "moderation.recommend"] }
  ];
}

export async function scaffold(args) {
  const slug = args.slug;
  const name = args.name;
  const guildId = args["guild-id"] || "000000000000000";
  const clientId = args["client-id"] || "000000000000000";
  if (!slug || !/^[a-z][a-z0-9-]{1,63}$/.test(slug)) throw new Error("--slug must be 2-64 lowercase letters, digits, or hyphens");
  if (!name) throw new Error("--name is required");
  const target = resolve(args.output || resolve(process.cwd(), "discord-communities", slug));
  await mkdir(target, { recursive: true });
  if ((await readdir(target)).length) throw new Error(`Target is not empty: ${target}`);

  const template = resolve(pluginRoot, "skills/discord-agent-army/assets/community-template");
  await cp(template, target, { recursive: true });
  const serverPath = resolve(target, "config/server.json");
  const server = JSON.parse(await readFile(serverPath, "utf8"));
  server.guildLabel = name;
  await writeFile(serverPath, `${JSON.stringify(server, null, 2)}\n`);

  let env = await readFile(resolve(target, ".env.example"), "utf8");
  env = env.replace(/^DISCORD_CLIENT_ID=.*$/m, `DISCORD_CLIENT_ID=${clientId}`).replace(/^DISCORD_GUILD_ID=.*$/m, `DISCORD_GUILD_ID=${guildId}`);
  await writeFile(resolve(target, ".env"), env, { mode: 0o600 });

  const contract = {
    contractVersion: "1.0",
    tenant: { id: slug, displayName: name },
    discord: { guildId, clientId, credentialMode: "local-env" },
    runtime: { mode: "isolated-process" },
    agents: defaultAgents(),
    approvals: ["guild.apply", "announcement.publish", "news.publish", "moderation.enforce", "verification.decide"],
    data: { messageTraining: false, retentionDays: 30 }
  };
  await writeFile(resolve(target, "community.contract.json"), `${JSON.stringify(contract, null, 2)}\n`);
  return { target, contract };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scaffold(parseArgs(process.argv.slice(2)))
    .then(({ target, contract }) => console.log(JSON.stringify({ created: target, tenant: contract.tenant.id, guildId: contract.discord.guildId, next: ["Set DISCORD_TOKEN in .env", "npm install", "npm test", "npm run doctor", "npm run provision"] }, null, 2)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
