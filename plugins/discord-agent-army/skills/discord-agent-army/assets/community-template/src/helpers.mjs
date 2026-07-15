import { PermissionFlagsBits } from "discord.js";

export const byName = (collection, name) => collection.find((item) => item?.name === name);

export function reviewer(interaction, server) {
  const role = byName(interaction.guild.roles.cache, server.roles.humanReviewer);
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) || (role && interaction.member.roles.cache.has(role.id));
}

export function safeChannelName(text) {
  return text.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "member";
}
