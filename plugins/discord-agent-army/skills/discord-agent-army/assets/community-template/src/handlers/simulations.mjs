import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { byName, reviewer } from "../helpers.mjs";

export const testNews = [
  { title: "AI Builders Demo Night opens", body: "Three fictional teams are testing tiny community tools. This is sample copy for layout and moderation testing.", color: 0x5865f2 },
  { title: "Research Club picks a paper", body: "A fictional reading group selected a pretend paper for Thursday. No real event has been scheduled.", color: 0x9b59b6 },
  { title: "Weekend creation challenge", body: "Test prompt: build one playful prototype in 90 minutes and share a screenshot. This announcement is only a simulation.", color: 0xe91e63 }
];

const channelLink = (guildId, channel) => `https://discord.com/channels/${guildId}/${channel.id}`;
const deleteRow = (ownerId) => new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`sim-delete:${ownerId}`).setLabel("Delete simulation").setEmoji("🗑️").setStyle(ButtonStyle.Danger));

export async function sendArrival({ guild, user, server, simulated = false, ownerId }) {
  const channel = byName(guild.channels.cache, server.channels.welcome);
  if (!channel) throw new Error("Welcome channel is missing. Run provisioning first.");
  const verify = byName(guild.channels.cache, server.channels.verificationPanel);
  const interests = byName(guild.channels.cache, server.channels.interests);
  const ticket = byName(guild.channels.cache, server.channels.ticketPanel);
  const news = byName(guild.channels.cache, server.channels.news);
  const label = simulated ? " · SIMULATION" : "";
  const components = new ActionRowBuilder();
  if (verify) components.addComponents(new ButtonBuilder().setLabel("Human verification").setURL(channelLink(guild.id, verify)).setStyle(ButtonStyle.Link));
  if (interests) components.addComponents(new ButtonBuilder().setLabel("Choose interests").setURL(channelLink(guild.id, interests)).setStyle(ButtonStyle.Link));
  if (ticket) components.addComponents(new ButtonBuilder().setLabel("Get help").setURL(channelLink(guild.id, ticket)).setStyle(ButtonStyle.Link));
  if (news) components.addComponents(new ButtonBuilder().setLabel("Agent news lab").setURL(channelLink(guild.id, news)).setStyle(ButtonStyle.Link));
  const rows = [components];
  if (simulated) rows.push(deleteRow(ownerId));

  return channel.send({
    content: `${user}`,
    embeds: [
      new EmbedBuilder().setTitle(`👋 Welcome Agent${label}`).setDescription(`Welcome to **${guild.name}**, ${user}! I’m an automated bot agent, here to make your first minute easy.`).setColor(0x57f287),
      new EmbedBuilder().setTitle(`🧭 Guide Agent${label}`).setDescription("1. Request human verification\n2. Choose interest roles\n3. Browse the test news lab\n4. Open a private ticket if you get stuck").setColor(0x5865f2),
      new EmbedBuilder().setTitle(`⚡ Hype Agent${label}`).setDescription("Pick interests to receive only relevant event and community announcements. No mass DMs.").setFooter({ text: simulated ? "Fake arrival test • Safe to delete" : "Automated welcome • AI disclosed" }).setColor(0xfee75c)
    ],
    components: rows,
    allowedMentions: { users: [user.id] }
  });
}

export async function runSimulation(interaction, server) {
  const kind = interaction.options.getSubcommand();
  if (kind === "arrival") {
    const user = interaction.options.getUser("member") || interaction.user;
    const message = await sendArrival({ guild: interaction.guild, user, server, simulated: true, ownerId: interaction.user.id });
    return interaction.reply({ content: `Arrival simulation posted: ${message.url}`, ephemeral: true });
  }

  const channel = byName(interaction.guild.channels.cache, server.channels.news);
  if (!channel) return interaction.reply({ content: "News lab channel is missing. Run provisioning first.", ephemeral: true });
  const count = interaction.options.getInteger("count") || 3;
  const messages = [];
  for (const story of testNews.slice(0, count)) {
    const message = await channel.send({
      embeds: [new EmbedBuilder().setAuthor({ name: "🤖 News Scout · SIMULATION" }).setTitle(story.title).setDescription(story.body).addFields({ name: "Status", value: "FAKE TEST NEWS — not a real claim" }).setFooter({ text: `Requested by ${interaction.user.username} • Delete anytime` }).setColor(story.color).setTimestamp()],
      components: [deleteRow(interaction.user.id)]
    });
    messages.push(message.url);
  }
  return interaction.reply({ content: `Posted ${messages.length} deletable simulation${messages.length === 1 ? "" : "s"}:\n${messages.join("\n")}`, ephemeral: true });
}

export async function deleteSimulation(interaction, server) {
  const ownerId = interaction.customId.split(":")[1];
  if (interaction.user.id !== ownerId && !reviewer(interaction, server)) return interaction.reply({ content: "Only the simulation owner or a human reviewer can delete this.", ephemeral: true });
  await interaction.reply({ content: "Simulation deleted.", ephemeral: true });
  await interaction.message.delete();
}
