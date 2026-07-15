import { ChannelType, Client, GatewayIntentBits, PermissionFlagsBits, REST, Routes } from "discord.js";
import { loadConfig } from "./config.mjs";
import { commands } from "./commands.mjs";
import { byName } from "./helpers.mjs";

const config = await loadConfig();
const apply = process.argv.includes("--apply");
const roleNames = [config.server.roles.humanReviewer, config.server.roles.verified, ...config.server.roles.interests.map((i) => i.name)];
const channelNames = Object.values(config.server.channels);
console.log(JSON.stringify({ mode: apply ? "APPLY" : "DRY_RUN", guildId: config.env.guildId, roles: roleNames, channels: channelNames, commands: commands(config.server).map((c) => c.name) }, null, 2));
if (!apply) {
  console.log("Dry run only. Re-run with --apply after confirming the target guild and names.");
  process.exit(0);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(config.env.token);
const guild = await client.guilds.fetch(config.env.guildId);
await guild.roles.fetch();
await guild.channels.fetch();

for (const name of roleNames) {
  if (!byName(guild.roles.cache, name)) await guild.roles.create({ name, mentionable: false, reason: "Discord community operator provisioning" });
}

const reviewerRole = byName(guild.roles.cache, config.server.roles.humanReviewer);
const ensureChannel = async (name, type = ChannelType.GuildText, options = {}) => byName(guild.channels.cache, name) || guild.channels.create({ name, type, reason: "Discord community operator provisioning", ...options });
const category = await ensureChannel(config.server.channels.ticketCategory, ChannelType.GuildCategory, { permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: reviewerRole.id, allow: [PermissionFlagsBits.ViewChannel] }, { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] }] });
for (const key of ["ticketPanel", "verificationPanel", "interests", "faq", "hype", "welcome", "news"]) await ensureChannel(config.server.channels[key]);
await ensureChannel(config.server.channels.verificationQueue, ChannelType.GuildText, { permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: reviewerRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] });
void category;

const rest = new REST({ version: "10" }).setToken(config.env.token);
await rest.put(Routes.applicationGuildCommands(config.env.clientId, config.env.guildId), { body: commands(config.server) });
console.log(`Provisioned ${guild.name}. Run the bot, then use /setup once.`);
client.destroy();
