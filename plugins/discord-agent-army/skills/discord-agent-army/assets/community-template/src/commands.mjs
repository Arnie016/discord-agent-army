import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export function commands(server) {
  const interests = server.roles.interests.slice(0, 25).map((item) => ({ name: item.name, value: item.key }));
  return [
    new SlashCommandBuilder().setName("ticket").setDescription("Open a private support ticket"),
    new SlashCommandBuilder().setName("faq").setDescription("Ask the approved FAQ").addStringOption((o) => o.setName("question").setDescription("Your question").setRequired(true).setMaxLength(500)),
    new SlashCommandBuilder().setName("setup").setDescription("Post the ticket, verification, and interest panels").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    new SlashCommandBuilder().setName("simulate").setDescription("Run clearly labeled test agent simulations").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand((s) => s.setName("arrival").setDescription("Simulate the automated arrival agents").addUserOption((o) => o.setName("member").setDescription("Optional member to welcome")))
      .addSubcommand((s) => s.setName("news").setDescription("Post deletable fake news cards").addIntegerOption((o) => o.setName("count").setDescription("Number of cards").setMinValue(1).setMaxValue(3))),
    new SlashCommandBuilder().setName("hype").setDescription("Post one approved interest announcement")
      .addStringOption((o) => o.setName("title").setDescription("Announcement title").setRequired(true).setMaxLength(100))
      .addStringOption((o) => o.setName("message").setDescription("Announcement copy").setRequired(true).setMaxLength(1000))
      .addStringOption((o) => o.setName("interest").setDescription("Interest group").setRequired(true).addChoices(...interests))
      .addStringOption((o) => o.setName("link").setDescription("Optional https link"))
  ].map((command) => command.toJSON());
}
