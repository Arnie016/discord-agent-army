import { Client, Events, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config.mjs";
import { matchFaq } from "./faq.mjs";
import { groundedFaqAnswer } from "./ai.mjs";
import { postPanels } from "./panels.mjs";
import { showTicketModal, submitTicket, ticketAction } from "./handlers/tickets.mjs";
import { showVerificationModal, submitVerification, decideVerification } from "./handlers/verification.mjs";
import { updateInterests } from "./handlers/interests.mjs";
import { postHype } from "./handlers/hype.mjs";
import { deleteSimulation, runSimulation, sendArrival } from "./handlers/simulations.mjs";

const config = await loadConfig();
const intents = [GatewayIntentBits.Guilds];
if (config.env.memberWelcomeEnabled) intents.push(GatewayIntentBits.GuildMembers);
const client = new Client({ intents });

client.once(Events.ClientReady, (ready) => console.log(`Ready as ${ready.user.tag}; guild ${config.env.guildId}`));
if (config.env.memberWelcomeEnabled) {
  client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== config.env.guildId || member.user.bot) return;
    await sendArrival({ guild: member.guild, user: member.user, server: config.server }).catch(console.error);
  });
}
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.inGuild() || interaction.guildId !== config.env.guildId) return;
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "ticket") return showTicketModal(interaction);
      if (interaction.commandName === "setup") return postPanels(interaction, config.server);
      if (interaction.commandName === "hype") return postHype(interaction, config.server);
      if (interaction.commandName === "simulate") return runSimulation(interaction, config.server);
      if (interaction.commandName === "faq") {
        await interaction.deferReply({ ephemeral: true });
        const question = interaction.options.getString("question", true);
        const match = matchFaq(question, config.faqs);
        if (!match.faq || match.score < config.server.faqThreshold) return interaction.editReply("I cannot answer that confidently from the approved FAQ. Please open a ticket for human review.");
        return interaction.editReply(await groundedFaqAnswer({ question, faq: match.faq, userId: interaction.user.id, env: config.env }));
      }
    }
    if (interaction.isButton()) {
      if (interaction.customId === "ticket-open") return showTicketModal(interaction);
      if (interaction.customId === "verify-open") return showVerificationModal(interaction);
      if (interaction.customId.startsWith("sim-delete:")) return deleteSimulation(interaction, config.server);
      if (interaction.customId.startsWith("ticket-")) return ticketAction(interaction, config.server);
      if (interaction.customId.startsWith("verify-")) return decideVerification(interaction, config.server);
    }
    if (interaction.isModalSubmit()) {
      if (interaction.customId === "ticket-submit") return submitTicket(interaction, config);
      if (interaction.customId === "verify-submit") return submitVerification(interaction, config.server);
    }
    if (interaction.isStringSelectMenu() && interaction.customId === "interests-select") return updateInterests(interaction, config.server);
  } catch (error) {
    console.error(error);
    const message = { content: "That action failed safely. A human operator should check the bot logs.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(message).catch(() => {});
    else await interaction.reply(message).catch(() => {});
  }
});

await client.login(config.env.token);
