const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  { timeFormatter: { msInSecond } } = require('#Utils');

/** @type {command<'slash'>} */
module.exports = {
  permissions: { user: ['ManageMessages'] },
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    { name: 'create', type: 'Subcommand' },
    { name: 'end', type: 'Subcommand' },
    { name: 'edit', type: 'Subcommand' },
    { name: 'reroll', type: 'Subcommand' }
  ],

  async run(lang) {
    if (!this.client.giveawaysManager) return this.editReply(lang('managerNotFound'));

    const giveawayId = this.options.getString('id');
    if (giveawayId) {
      const giveaway = this.client.giveawaysManager.giveaways.find(e => e.guildId == this.guild.id && e.messageId == giveawayId);

      if (!giveaway || giveaway.ended && ['edit', 'end'].includes(this.options.getSubcommand())) return this.editReply(lang('notFound'));
      if (giveaway.hostedBy.id != this.user.id && !this.member.permissions.has(PermissionFlagsBits.Administrator))
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

    if (!durationUnformatted) return this.editReply(lang('invalidTime'));

    const duration = getMilliseconds(durationUnformatted);
    if (duration == undefined) return this.editReply(lang('invalidTime'));

    return { components, bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId };
  }
};