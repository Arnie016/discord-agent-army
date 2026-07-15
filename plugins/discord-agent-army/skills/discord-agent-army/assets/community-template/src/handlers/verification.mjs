import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { byName, reviewer } from "../helpers.mjs";

export async function showVerificationModal(interaction) {
  const modal = new ModalBuilder().setCustomId("verify-submit").setTitle("Request human verification");
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reason").setLabel("Why would you like to join?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(700)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reference").setLabel("Optional reference or context (no ID docs)").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(200))
  );
  await interaction.showModal(modal);
}

export async function submitVerification(interaction, server) {
  const queue = byName(interaction.guild.channels.cache, server.channels.verificationQueue);
  if (!queue) return interaction.reply({ content: "Verification queue is not configured.", ephemeral: true });
  const reason = interaction.fields.getTextInputValue("reason");
  const reference = interaction.fields.getTextInputValue("reference") || "None supplied";
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`verify-approve:${interaction.user.id}`).setLabel("Approve").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`verify-reject:${interaction.user.id}`).setLabel("Reject").setStyle(ButtonStyle.Danger)
  );
  await queue.send({ embeds: [new EmbedBuilder().setTitle("Verification request").setDescription(`Applicant: ${interaction.user}\n\n**Reason**\n${reason}\n\n**Reference**\n${reference}`).setFooter({ text: "Human decision required" }).setColor(0xf1c40f)], components: [row] });
  await interaction.reply({ content: "Submitted for human review.", ephemeral: true });
}

export async function decideVerification(interaction, server) {
  if (!reviewer(interaction, server)) return interaction.reply({ content: "Only a human reviewer can decide verification.", ephemeral: true });
  const [action, userId] = interaction.customId.split(":");
  const member = await interaction.guild.members.fetch(userId);
  if (action === "verify-approve") {
    const role = byName(interaction.guild.roles.cache, server.roles.verified);
    if (!role) return interaction.reply({ content: "Verified role is missing.", ephemeral: true });
    await member.roles.add(role, `Approved by human reviewer ${interaction.user.id}`);
  }
  const decision = action === "verify-approve" ? "approved" : "rejected";
  await interaction.update({ content: `Human decision by ${interaction.user}: **${decision}**`, embeds: interaction.message.embeds, components: [] });
  await member.send(`Your verification request in **${interaction.guild.name}** was ${decision} by a human reviewer.`).catch(() => {});
}
