import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function json(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

export async function loadConfig({ requireSecrets = true } = {}) {
  const server = await json("config/server.json");
  const faqs = await json("config/faqs.json");
  const env = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
    openaiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    safetySalt: process.env.OPENAI_SAFETY_SALT || "local-development",
    memberWelcomeEnabled: process.env.ENABLE_MEMBER_WELCOME === "true"
  };

  const errors = [];
  if (!Array.isArray(faqs) || !faqs.length) errors.push("config/faqs.json must contain at least one FAQ");
  if (!server.roles?.humanReviewer || !server.roles?.verified) errors.push("reviewer and verified roles are required");
  if (!Array.isArray(server.roles?.interests) || !server.roles.interests.length) errors.push("at least one interest is required");
  if (requireSecrets) {
    for (const [key, value] of [["DISCORD_TOKEN", env.token], ["DISCORD_CLIENT_ID", env.clientId], ["DISCORD_GUILD_ID", env.guildId]]) {
      if (!value) errors.push(`${key} is missing`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return { root, server, faqs, env };
}
