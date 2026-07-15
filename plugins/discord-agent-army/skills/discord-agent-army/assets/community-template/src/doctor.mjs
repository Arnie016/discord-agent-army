import { loadConfig } from "./config.mjs";

const config = await loadConfig({ requireSecrets: false });
const missing = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID"].filter((key) => !process.env[key]);
console.log(`Config valid: ${config.faqs.length} FAQs, ${config.server.roles.interests.length} interests.`);
console.log(missing.length ? `Live connection blocked by: ${missing.join(", ")}` : "Live Discord credentials are present.");
console.log(config.env.openaiKey ? `AI mode enabled with ${config.env.openaiModel}.` : "FAQ-only mode enabled; OPENAI_API_KEY is optional.");
console.log(config.env.memberWelcomeEnabled ? "Real arrival automation enabled; Server Members Intent must be on." : "Real arrival automation disabled; /simulate arrival remains available.");
