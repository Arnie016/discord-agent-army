import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const command = argv[0] || "list";
const option = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};
const root = resolve(option("root", resolve(process.cwd(), "discord-communities")));
const selectedSlug = option("slug");

function instances() {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(root, entry.name, "community.contract.json")))
    .map((entry) => {
      const path = resolve(root, entry.name);
      const contract = JSON.parse(readFileSync(resolve(path, "community.contract.json"), "utf8"));
      const env = existsSync(resolve(path, ".env")) ? readFileSync(resolve(path, ".env"), "utf8") : "";
      const value = (key) => env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
      return { slug: entry.name, path, contract, token: Boolean(value("DISCORD_TOKEN")), dependencies: existsSync(resolve(path, "node_modules")) };
    });
}

function validate(instance) {
  const errors = [];
  if (instance.slug !== instance.contract.tenant?.id) errors.push("folder slug differs from contract tenant id");
  if (!/^\d{15,22}$/.test(instance.contract.discord?.guildId || "")) errors.push("invalid guild id");
  if (!Array.isArray(instance.contract.agents) || !instance.contract.agents.length) errors.push("no agent contracts");
  if (instance.contract.data?.messageTraining !== false) errors.push("messageTraining must be false");
  return errors;
}

function targets() {
  const all = instances();
  if (!selectedSlug) return all;
  const selected = all.filter((instance) => instance.slug === selectedSlug);
  if (!selected.length) throw new Error(`Unknown tenant: ${selectedSlug}`);
  return selected;
}

function run(instance, args, foreground = false) {
  return spawnSync("npm", args, { cwd: instance.path, stdio: foreground ? "inherit" : "pipe", encoding: "utf8" });
}

try {
  if (command === "list") {
    console.table(targets().map((i) => ({ tenant: i.slug, guild: i.contract.discord.guildId, agents: i.contract.agents.length, token: i.token ? "present" : "missing", dependencies: i.dependencies ? "installed" : "missing" })));
  } else if (command === "doctor") {
    let failed = false;
    for (const instance of targets()) {
      const errors = validate(instance);
      if (!instance.token) errors.push("DISCORD_TOKEN missing");
      if (!instance.dependencies) errors.push("npm dependencies missing");
      console.log(`${instance.slug}: ${errors.length ? `BLOCKED — ${errors.join("; ")}` : "ready"}`);
      failed ||= errors.length > 0;
    }
    if (failed) process.exitCode = 1;
  } else if (command === "plan") {
    for (const instance of targets()) {
      if (!instance.token || !instance.dependencies) throw new Error(`${instance.slug} is not ready; run doctor`);
      console.log(`\n[${instance.slug}] read-only plan`);
      const result = run(instance, ["run", "provision"]);
      process.stdout.write(result.stdout || "");
      process.stderr.write(result.stderr || "");
      if (result.status) process.exitCode = result.status;
    }
  } else if (command === "apply") {
    if (!selectedSlug) throw new Error("apply requires --slug; bulk apply is forbidden");
    const [instance] = targets();
    const confirmation = option("confirm");
    if (confirmation !== instance.contract.discord.guildId) throw new Error(`Pass --confirm ${instance.contract.discord.guildId} after reviewing the plan`);
    const result = run(instance, ["run", "provision", "--", "--apply"], true);
    process.exitCode = result.status || 0;
  } else if (command === "start") {
    if (!selectedSlug) throw new Error("start requires --slug");
    const [instance] = targets();
    const result = run(instance, ["start"], true);
    process.exitCode = result.status || 0;
  } else {
    throw new Error("Commands: list, doctor, plan, apply, start");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
