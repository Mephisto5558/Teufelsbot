const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { Command, CommandType, CooldownType, Permission, PermissionType } = require('@mephisto5558/command'),
  { getMilliseconds } = require('better-ms');

module.exports = new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.User]: [Permission.ManageMessages] },
  cooldowns: { [CooldownType.User]: '1s' },
  ephemeralDefer: true,
  options: [
    require('./create'),
    require('./end'),
    require('./edit'),
    require('./reroll')
  ],

  async run(lang) {
    if (!this.client.giveawaysManager) return this.editReply(lang('managerNotFound'));

    const giveawayId = this.options.getString('id');
    if (giveawayId) {
      const giveaway = this.client.giveawaysManager.giveaways.find(e => e.guildId == this.guild.id && e.messageId == giveawayId);

      if (!giveaway || giveaway.ended && ['edit', 'end'].includes(this.options.getSubcommand())) return this.editReply(lang('notFound'));
      if (giveaway.hostedBy.id != this.user.id && !this.member.permissions.has(Permission.Administrator))
        return this.editReply(lang('notHost'));
    }

    const
      bonusEntries = this.options.getString('bonus_entries')?.split(' ').map(e => ({ [e.split(':')[0].replaceAll(/\D/g, '')]: e.split(':')[1] })),
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
      duration = getMilliseconds(durationUnformatted);
      if (duration == undefined) return this.editReply(lang('invalidTime'));
    }

    return { components, bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId };
  }
});