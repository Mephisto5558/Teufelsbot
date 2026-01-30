/** @import { customPermissionChecksFn } from '@mephisto5558/command' */


const { Role } = require('discord.js');

/** @type {customPermissionChecksFn} */
module.exports = function commandPermissionCheck(interaction, author) {
  const disabledList = interaction.guild?.db.config.commands?.[this.name]?.disabled;
  if (disabledList && interaction.member && author.id != interaction.guild.ownerId) {
    if (Object.values(disabledList).some(e => Array.isArray(e) && e.includes('*'))) return ['notAllowed.anyone'];
    if (disabledList.users?.includes(author.id)) return ['notAllowed.user'];
    if (disabledList.channels?.includes(interaction.channel?.id)) return ['notAllowed.channel'];
    if (
      disabledList.roles && ('cache' in interaction.member.roles ? interaction.member.roles.cache : interaction.member.roles)
        .some(e => disabledList.roles.includes(e instanceof Role ? e.id : e))
    ) return ['notAllowed.role'];
  }
};