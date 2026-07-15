import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from "discord.js";
import { groundedFaqAnswer } from "../ai.mjs";
import { matchFaq } from "../faq.mjs";
import { byName, reviewer, safeChannelName } from "../helpers.mjs";

export async function showTicketModal(interaction) {
  const modal = new ModalBuilder().setCustomId("ticket-submit").setTitle("Open a support ticket");
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("subject").setLabel("Subject").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("question").setLabel("What do you need help with?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))
  );
  await interaction.showModal(modal);
}

export async function submitTicket(interaction, config) {
  const { server, faqs, env } = config;
  await interaction.deferReply({ ephemeral: true });
  const existing = interaction.guild.channels.cache.find((c) => c.topic?.includes(`ticket-owner:${interaction.user.id}`) && !c.name.startsWith("closed-"));
  if (existing) return interaction.editReply(`You already have an open ticket: ${existing}`);
  const category = byName(interaction.guild.channels.cache, server.channels.ticketCategory);
  const reviewRole = byName(interaction.guild.roles.cache, server.roles.humanReviewer);
  const subject = interaction.fields.getTextInputValue("subject");
  const question = interaction.fields.getTextInputValue("question");
  const channel = await interaction.guild.channels.create({
    name: `ticket-${safeChannelName(interaction.user.username)}-${interaction.user.id.slice(-4)}`,
    type: ChannelType.GuildText,
    parent: category?.id,
    topic: `ticket-owner:${interaction.user.id}|status:new|subject:${subject.slice(0, 80)}`,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(reviewRole ? [{ id: reviewRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : []),
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
    ]
  });
  await interaction.editReply(`Created ${channel}.`);

  const match = matchFaq(question, faqs);
  const confident = match.faq && match.score >= server.faqThreshold;
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket-solved:${interaction.user.id}`).setLabel("Solved").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`ticket-human:${interaction.user.id}`).setLabel("Need human").setStyle(ButtonStyle.Secondary)
  );
  if (confident) {
    const answer = await groundedFaqAnswer({ question, faq: match.faq, userId: interaction.user.id, env });
    await channel.setTopic(channel.topic.replace("status:new", "status:faq-answered"));
    await channel.send({ content: `${interaction.user}`, embeds: [new EmbedBuilder().setTitle(subject).setDescription(answer).setFooter({ text: `AI-assisted from approved FAQ: ${match.faq.id}` }).setColor(0x5865f2)], components: [buttons] });
  } else {
    await channel.setTopic(channel.topic.replace("status:new", "status:pending-human"));
    await channel.send({ content: `${interaction.user} ${reviewRole || ""}`.trim(), embeds: [new EmbedBuilder().setTitle(subject).setDescription(`**pending-human**\n\n${question}`).setColor(0xe67e22)], components: [buttons], allowedMentions: { roles: reviewRole ? [reviewRole.id] : [], users: [interaction.user.id] } });
  }
}

export async function ticketAction(interaction, server) {
  const [action, ownerId] = interaction.customId.split(":");
  const isOwner = interaction.user.id === ownerId;
  if (!isOwner && !reviewer(interaction, server)) return interaction.reply({ content: "Only the ticket owner or a human reviewer can do that.", ephemeral: true });
  if (action === "ticket-human") {
    const role = byName(interaction.guild.roles.cache, server.roles.humanReviewer);
    await interaction.channel.setTopic(interaction.channel.topic.replace(/status:[^|]+/, "status:pending-human"));
    await interaction.reply({ content: `${role || "Human support"}: this ticket is **pending-human**.`, allowedMentions: { roles: role ? [role.id] : [] } });
  } else {
    await interaction.channel.setTopic(interaction.channel.topic.replace(/status:[^|]+/, "status:solved"));
    await interaction.channel.setName(`closed-${interaction.channel.name.replace(/^closed-/, "")}`.slice(0, 100));
    await interaction.reply("Ticket marked solved. A reviewer may archive or delete it later.");
  }
}
