import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { byName } from "./helpers.mjs";

export async function postPanels(interaction, server) {
  const channels = interaction.guild.channels.cache;
  const ticket = byName(channels, server.channels.ticketPanel);
  const verify = byName(channels, server.channels.verificationPanel);
  const interests = byName(channels, server.channels.interests);
  if (!ticket || !verify || !interests) throw new Error("Run provisioning first; one or more panel channels are missing.");

  await ticket.send({
    embeds: [new EmbedBuilder().setTitle("Support tickets").setDescription("Open a private ticket. Approved FAQs answer routine questions; uncertain cases become **pending-human**.").setColor(0x5865f2)],
    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket-open").setLabel("Open ticket").setStyle(ButtonStyle.Primary))]
  });
  await verify.send({
    embeds: [new EmbedBuilder().setTitle("Human verification").setDescription("Submit a short application. A human reviewer—not AI—makes the decision.").setColor(0xf1c40f)],
    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("verify-open").setLabel("Request verification").setStyle(ButtonStyle.Secondary))]
  });
  const menu = new StringSelectMenuBuilder().setCustomId("interests-select").setPlaceholder("Choose interests").setMinValues(0).setMaxValues(server.roles.interests.length)
    .addOptions(server.roles.interests.map((item) => ({ label: item.name, value: item.key, description: item.description, emoji: item.emoji })));
  await interests.send({
    embeds: [new EmbedBuilder().setTitle("Choose your interests").setDescription("These roles control relevant event and announcement mentions.").setColor(0x2ecc71)],
    components: [new ActionRowBuilder().addComponents(menu)]
  });
  await interaction.reply({ content: "Panels posted.", ephemeral: true });
}
