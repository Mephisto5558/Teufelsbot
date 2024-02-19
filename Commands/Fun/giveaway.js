const
  { Constants, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  { timeValidator } = require('../../Utils'),

  giveawayMainFunctions = {
    /** @typedef {{ bonusEntries: object[], requiredRoles: string[], disallowedMembers: string[], duration: number, giveawayId: string }}mainFunctionsParams*/

    /**
     * @this {GuildInteraction}
     * @param {lang}lang
     * @param {ActionRowBuilder<ButtonBuilder>[]}components
     * @param {mainFunctionsParams}options*/
    create: async function (lang, components, { bonusEntries, requiredRoles, disallowedMembers, duration }) {
      const
        defaultSettings = this.client.defaultSettings.giveaway,
        reaction = this.options.getString('reaction') ?? this.guild.db.giveaway?.reaction ?? defaultSettings.reaction,
        startOptions = {
          winnerCount: this.options.getInteger('winner_count'),
          prize: this.options.getString('prize'),
          hostedBy: this.user,
          botsCanWin: false,
          bonusEntries: { bonus: member => bonusEntries[member.id] },
          embedColor: Number.parseInt(this.options.getString('embed_color')?.slice(1) ?? 0, 16) || this.guild.db.giveaway?.embedColor || defaultSettings.embedColor,
          embedColorEnd: Number.parseInt(this.options.getString('embed_color_end')?.slice(1) ?? 0, 16) || this.guild.db.giveaway?.embedColorEnd || defaultSettings.embedColorEnd,
          reaction, duration,
          messages: {
            giveaway: lang('newGiveaway'),
            giveawayEnded: lang('giveawayEnded'),
            inviteToParticipate:
              `${this.options.getString('description')}\n\n`
              + (requiredRoles?.length ? lang('requiredRoles', `<@&${requiredRoles.join('>, <@&')}>\n`) : '')
              + (disallowedMembers?.length ? lang('disallowedMembers', `<@${disallowedMembers.join('< <@')}>\n`) : '')
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
          lastChance: this.guild.db.giveaway?.useLastChance ?? defaultSettings.useLastChance,
          isDrop: this.options.getBoolean('is_drop')
        };

      if (requiredRoles?.length || disallowedMembers?.length)

        /** @param {import('discord.js').GuildMember}member*/
        startOptions.exemptMembers = member => !(member.roles.cache.some(e => requiredRoles?.includes(e.id)) && !disallowedMembers?.includes(member.id));

      const data = await this.client.giveawaysManager.start(this.options.getChannel('channel') ?? this.channel, startOptions);
      /* eslint-disable-next-line require-atomic-updates */
      components[0].components[0].data.url = data.messageURL; // I don't see any race donditions

      return this.editReply({ content: lang('started'), components });
    },

    /**
     * @this {GuildInteraction}
     * @param {lang}lang
     * @param {ActionRowBuilder<ButtonBuilder>[]}components
     * @param {mainFunctionsParams}options*/
    end: async function (lang, components, { giveawayId }) {
      const data = await this.client.giveawaysManager.end(giveawayId);
      components[0].components[0].data.url = data.messageURL;

      return this.editReply({ content: lang('ended'), components });
    },

    /**
     * @this {GuildInteraction}
     * @param {lang}lang
     * @param {ActionRowBuilder<ButtonBuilder>[]}components
     * @param {mainFunctionsParams}options*/
    edit: async function (lang, components, { bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId }) {
      const editOptions = {
        addTime: duration,
        newBonusEntries: {},
        newWinnerCount: this.options.getInteger('winner_count'),
        newPrize: this.options.getString('prize'),
        newThumbnail: this.options.getString('thumbnail'),
        newImage: this.options.getString('image')
      };

      if (requiredRoles.length || disallowedMembers.length)

      /** @param {import('discord.js').GuildMember}member*/
        editOptions.newExemptMembers = member => !(member.roles.cache.some(e => requiredRoles?.includes(e.id)) && !disallowedMembers.includes(member.id));
      if (bonusEntries.length) editOptions.newBonusEntries.bonus = member => bonusEntries[member.id];

      const data = await this.client.giveawaysManager.edit(giveawayId, editOptions);
      components[0].components[0].data.url = data.messageURL;

      return this.editReply({ content: lang('edited'), components });
    },

    /**
     * @this {GuildInteraction}
     * @param {lang}lang
     * @param {ActionRowBuilder<ButtonBuilder>[]}components
     * @param {mainFunctionsParams}options*/
    reroll: async function (lang, components, { giveawayId }) {
      const rerollOptions = {
        messages: {
          congrat: { content: lang('rerollWinners'), components },
          error: { content: lang('rerollNoWinner'), components }
        }
      };

      const data = await this.client.giveawaysManager.reroll(giveawayId, rerollOptions);
      /* eslint-disable-next-line require-atomic-updates */
      components[0].components[0].data.url = data.messageURL; // I don't see any race donditions

      return this.editReply({ content: lang('rerolled'), components });
    }
  };

/** @type {command<'slash'>}*/
module.exports = {
  name: 'giveaway',
  permissions: { user: ['ManageMessages'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'create',
      type: 'Subcommand',
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
          autocompleteOptions: function () { return timeValidator(this.focused.value); }
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
          channelTypes: Constants.TextBasedChannelTypes
        },
        { name: 'reaction', type: 'String' },
        { name: 'thumbnail', type: 'String' },
        { name: 'image', type: 'String' },
        { name: 'exempt_members', type: 'String' },
        { name: 'required_roles', type: 'String' },
        { name: 'bonus_entries', type: 'String' },
        { name: 'embed_color', type: 'String' },
        { name: 'embed_color_end', type: 'String' }
      ]
    },
    {
      name: 'end',
      type: 'Subcommand',
      options: [{
        name: 'id',
        type: 'String',
        required: true
      }]
    },
    {
      name: 'edit',
      type: 'Subcommand',
      options: [
        {
          name: 'id',
          type: 'String',
          required: true
        },
        {
          name: 'add_time',
          type: 'String',
          autocompleteOptions: function () { return timeValidator(this.focused.value); },
          strictAutocomplete: true
        },
        {
          name: 'winner_count',
          type: 'Integer',
          minValue: 1
        },
        { name: 'prize', type: 'String' },
        { name: 'thumbnail', type: 'String' },
        { name: 'image', type: 'String' },
        { name: 'exempt_members', type: 'String' },
        { name: 'required_roles', type: 'String' },
        { name: 'bonus_entries', type: 'String' }
      ]
    },
    {
      name: 'reroll',
      type: 'Subcommand',
      options: [{
        name: 'id',
        type: 'String',
        required: true
      }]
    }
  ],

  run: function (lang) {
    if (!this.client.giveawaysManager) return this.editReply(lang('managerNotFound'));

    const giveawayId = this.options.getString('id');
    let giveaway;

    if (giveawayId) {
      giveaway = this.client.giveawaysManager.giveaways.find(e => e.guildId == this.guild.id && e.messageId == giveawayId);

      if (!giveaway) return this.editReply(lang('notFound'));
      if (giveaway.hostedBy.slice(2, -1) != this.user.id && !this.member.permissions.has(PermissionFlagsBits.Administrator))
        return this.editReply(lang('notHost'));
    }

    const
      bonusEntries = this.options.getString('bonus_entries')?.split(' ').map(e => ({ [e.split(':')[0].replaceAll(/\D/g, '')]: e.split(':')[1] })),
      requiredRoles = this.options.getString('required_roles')?.replace(/\D/g, '').split(' '),
      disallowedMembers = this.options.getString('exempt_member')?.replace(/\D/g, '').split(' '),
      components = [new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('buttonLabel'),
          url: '{this.messageURL}', // intentional
          style: ButtonStyle.Link
        })]
      })],
      durationUnformatted = this.options.getString('duration') ?? this.options.getString('add_time') ?? 0,
      duration = getMilliseconds(durationUnformatted);

    if (typeof duration != 'number' && durationUnformatted) return this.editReply(lang('invalidTime'));

    return giveawayMainFunctions[this.options.getSubcommand()].call(this, lang, components, { bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId });
  }
};