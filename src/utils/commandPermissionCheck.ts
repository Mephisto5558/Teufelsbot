import { Role } from 'discord.js';

import type { customPermissionChecksFn } from '@mephisto5558/command';

/* eslint-disable-next-line func-style */
const commandPermissionCheck: customPermissionChecksFn = function commandPermissionCheck(interaction, author) {
  const disabledList = interaction.guild?.db.config.commands?.[this.name]?.disabled;

  if (disabledList && interaction.member && author.id != interaction.guild.ownerId) {
    if (Object.values(disabledList).some(e => Array.isArray(e) && e.includes('*'))) return ['notAllowed.anyone'];
    if (disabledList.users.includes(author.id)) return ['notAllowed.user'];
    if (disabledList.channels.includes(interaction.channel?.id)) return ['notAllowed.channel'];
    if (('cache' in interaction.member.roles ? interaction.member.roles.cache : interaction.member.roles)
      .some(role => disabledList.roles.includes(role instanceof Role ? role.id : role))
    ) return ['notAllowed.role'];
  }

  if (this.category == 'nsfw' && !interaction.channel.nsfw) return ['nsfw'];
};

export default commandPermissionCheck;