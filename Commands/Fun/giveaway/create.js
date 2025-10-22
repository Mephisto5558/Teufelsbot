const
  { Constants, bold, roleMention, userMention } = require('discord.js'),
  { timeValidator } = require('#Utils');

/** @type {import('.')} */
module.exports = {
  options: [
    {
      name: 'prize',
      type: 'String',
      required: true
    },
    {
      name: 'description',
      type: 'String',
      required: true
    },
    {
      name: 'duration',
      type: 'String',
      required: true,
      autocompleteOptions() { return timeValidator(this.focused.value); }
    },
    {
      name: 'winner_count',
      type: 'Integer',
      required: true,
      minValue: 1
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'reaction', type: 'String' },
    { name: 'thumbnail', type: 'String' },
    { name: 'image', type: 'String' },
    { name: 'exempt_members', type: 'String' },
    { name: 'required_roles', type: 'String' },
    { name: 'bonus_entries', type: 'String' },
    { name: 'embed_color', type: 'String' },
    { name: 'embed_color_end', type: 'String' }
  ],

  async run(lang, { components, bonusEntries, requiredRoles, disallowedMembers, duration }) {
    const
      defaultSettings = this.client.defaultSettings.giveaway,
      reaction = this.options.getString('reaction') ?? this.guild.db.giveaway?.reaction ?? defaultSettings.reaction,
      startOptions = {
        reaction, duration,
        winnerCount: this.options.getInteger('winner_count', true),
        prize: this.options.getString('prize', true),
        hostedBy: this.user,
        botsCanWin: false,
        bonusEntries: { bonus: member => bonusEntries[member.id] },
        embedColor: Number.parseInt(this.options.getString('embed_color')?.slice(1) ?? 0, 16)
          || (this.guild.db.giveaway?.embedColor ?? defaultSettings.embedColor),
        embedColorEnd: Number.parseInt(this.options.getString('embed_color_end')?.slice(1) ?? 0, 16)
          || (this.guild.db.giveaway?.embedColorEnd ?? defaultSettings.embedColorEnd),
        messages: {
          giveaway: bold(lang('newGiveaway')),
          giveawayEnded: bold(lang('giveawayEnded')),
          inviteToParticipate:
            `${this.options.getString('description', true)}\n\n`
            + (requiredRoles?.length > 0 ? lang('requiredRoles', `${requiredRoles.map(roleMention).join(', ')}\n`) : '')
            + (disallowedMembers?.length > 0 ? lang('disallowedMembers', `${disallowedMembers.map(userMention).join(', ')}\n`) : '')
            + lang('inviteToParticipate', reaction),
          winMessage: { content: lang('winMessage'), components },
          drawing: lang('drawing'),
          dropMessage: lang('dropMessage', reaction),
          embedFooter: lang('embedFooterText'),
          noWinner: lang('noWinner'),
          winners: lang('winners'),
          endedAt: lang('endedAt'),
          hostedBy: lang('hostedBy')
        },
        thumbnail: this.options.getString('thumbnail'),
        image: this.options.getString('image'),
        lastChance: this.guild.db.giveaway?.useLastChance,
        isDrop: this.options.getBoolean('is_drop')
      };

    if (requiredRoles?.length > 0 || disallowedMembers.length > 0)

      /** @param {import('discord.js').GuildMember} member */
      startOptions.exemptMembers = member => !(member.roles.cache.some(e => requiredRoles?.includes(e.id)) && !disallowedMembers.includes(member.id));

    await this.client.giveawaysManager.start(this.options.getChannel('channel') ?? this.channel, startOptions).then(data => {
      components[0].components[0].data.url = data.messageURL; // using .then() here to prevent `eslint/require-atomic-updates`
    });

    return this.editReply({ content: lang('started'), components });
  }
};