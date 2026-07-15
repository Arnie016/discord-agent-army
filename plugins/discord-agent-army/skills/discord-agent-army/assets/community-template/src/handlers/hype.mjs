import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { byName, reviewer } from "../helpers.mjs";

export async function postHype(interaction, server) {
  if (!reviewer(interaction, server)) return interaction.reply({ content: "A human reviewer or server manager must approve hype posts.", ephemeral: true });
  const channel = byName(interaction.guild.channels.cache, server.channels.hype);
  const interest = server.roles.interests.find((item) => item.key === interaction.options.getString("interest", true));
  const role = interest && byName(interaction.guild.roles.cache, interest.name);
  const link = interaction.options.getString("link");
  if (link && !/^https:\/\//i.test(link)) return interaction.reply({ content: "Links must start with https://", ephemeral: true });
  const components = link ? [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Open link").setURL(link).setStyle(ButtonStyle.Link))] : [];
  await channel.send({ content: role ? `${role}` : undefined, embeds: [new EmbedBuilder().setTitle(interaction.options.getString("title", true)).setDescription(interaction.options.getString("message", true)).setFooter({ text: `Approved by ${interaction.user.username}` }).setColor(0xe91e63)], components, allowedMentions: { roles: role ? [role.id] : [] } });
  await interaction.reply({ content: `Posted in ${channel}.`, ephemeral: true });
}
