import { PermissionsBitField, PermissionFlagsBits } from "discord.js";
import { loadConfig } from "./config.mjs";

const { env } = await loadConfig({ requireSecrets: false });
if (!env.clientId) throw new Error("Set DISCORD_CLIENT_ID in .env first.");
const permissions = new PermissionsBitField([
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles
]);
console.log(`https://discord.com/oauth2/authorize?client_id=${env.clientId}&scope=bot%20applications.commands&permissions=${permissions.bitfield}`);
