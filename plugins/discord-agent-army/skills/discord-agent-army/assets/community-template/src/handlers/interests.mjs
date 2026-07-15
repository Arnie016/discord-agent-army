import { byName } from "../helpers.mjs";

export async function updateInterests(interaction, server) {
  const configured = server.roles.interests.map((item) => ({ item, role: byName(interaction.guild.roles.cache, item.name) })).filter((x) => x.role);
  const selected = new Set(interaction.values);
  const add = configured.filter((x) => selected.has(x.item.key)).map((x) => x.role.id);
  const remove = configured.filter((x) => !selected.has(x.item.key)).map((x) => x.role.id);
  if (add.length) await interaction.member.roles.add(add, "Member interest selection");
  if (remove.length) await interaction.member.roles.remove(remove, "Member interest selection");
  await interaction.reply({ content: `Interests updated: ${selected.size ? [...selected].join(", ") : "none"}.`, ephemeral: true });
}
