import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

/** @returns the error message id to use with i18n. */
export default function checkTargetManageable(
  this: ChatInputCommandInteraction<'cached'> | Message<true>,
  member: GuildMember
): string | undefined {
  if (member.id == this.member.id) return 'cantPunishSelf';
  if (!member.manageable) return 'global.noPermBot';
  if (this.guild.ownerId != this.user.id && member.roles.highest.position >= this.member.roles.highest.position) return 'global.noPermUser';
}