import type { ChatInputCommandInteraction, Role } from 'discord.js';
import type { getTargetUtils } from './index.ts';

/** @default targetOptionName = 'target' */
export default function getTargetRole<
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- consistency with other getTargetXyz functions */
  I extends ChatInputCommandInteraction<'cached'> | Message<true>,
  const O extends getTargetUtils.Param
>(
  interaction: I, { targetOptionName = 'target', returnSelf = false }: O
): getTargetUtils.MaybeWithUndefined<Role, getTargetUtils.ShouldReturnSelf<O>> {
  let target = 'options' in interaction ? interaction.options.getRole(targetOptionName) : interaction.mentions.roles.first();
  if (!target && 'content' in interaction)
    target = interaction.guild.roles.cache.find(e => [e.id, e.name].some(e => [...interaction.args, interaction.content].includes(e)));
  if (target) return target;
  if (returnSelf) return interaction.member?.roles.highest;
}