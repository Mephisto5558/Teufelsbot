import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command, CommandOption, CommandType, CooldownType, Permission, PermissionType } from '@mephisto5558/command';
import { toMS } from 'type-better-ms';

import create from './create.ts';
import edit from './edit.ts';
import end from './end.ts';
import reroll from './reroll.ts';

import type { ContextType } from '@mephisto5558/command';


export const giveawaySubcommand = CommandOption.create<readonly [CommandType.Slash], readonly [ContextType.Guild], {
  components: ActionRowBuilder<ButtonBuilder>[];
  bonusEntries?: Record<Snowflake, string>; requiredRoles?: Snowflake[];
  disallowedMembers?: Snowflake[]; duration?: number; giveawayId?: Snowflake;
}>();

export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.User]: [Permission.ManageMessages] },
  cooldowns: { [CooldownType.User]: '1s' },
  ephemeralDefer: true,
  options: [
    create,
    end,
    edit,
    reroll
  ],

  async run(lang) {
    if (!this.client.giveawaysManager) return this.editReply(lang('managerNotFound'));

    const giveawayId = this.options.getString('id');
    if (giveawayId) {
      const giveaway = this.client.giveawaysManager.giveaways.find(e => e.guildId == this.guild.id && e.messageId == giveawayId);

      if (!giveaway || giveaway.ended && ['edit', 'end'].includes(this.options.getSubcommand())) return this.editReply(lang('notFound'));
      if (giveaway.hostedBy?.id != this.user.id && !this.member.permissions.has(Permission.Administrator))
        return this.editReply(lang('notHost'));
    }

    const
      bonusEntries = this.options.getString('bonus_entries')?.split(' ').map(e => {
        const [k, v] = e.split(':', 2);
        return { [k.replaceAll(/\D/g, '')]: v };
      }),
      requiredRoles = this.options.getString('required_roles')?.replaceAll(/\D/g, '').split(' '),
      disallowedMembers = this.options.getString('exempt_member')?.replaceAll(/\D/g, '').split(' '),
      components = [new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('buttonLabel'),
          url: '{this.messageURL}', // intentional
          style: ButtonStyle.Link
        })]
      })],
      durationUnformatted = this.options.getString('duration') ?? this.options.getString('add_time');

    let duration;
    if (durationUnformatted) {
      duration = toMS(durationUnformatted);
      if (!duration) return this.editReply(lang('invalidTime'));
    }

    return { components, bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId };
  }
});