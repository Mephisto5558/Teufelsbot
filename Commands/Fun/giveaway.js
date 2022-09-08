const
  { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js'),
  { getMilliseconds } = require('better-ms');

module.exports = {
  name: 'giveaway',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: ['ManageMessages'] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true, beta: true,
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
          required: true
        },
        {
          name: 'winner_count',
          type: 'Number',
          minValue: 1,
          required: true
        },
        {
          name: 'channel',
          type: 'Channel',
          channelTypes: ['GuildText', 'GuildNews']
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
        { name: 'add_time', type: 'String' },
        {
          name: 'winner_count',
          type: 'String',
          minValue: 1,
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

  run: async (interaction, lang, { db, giveawaysManager }) => {
    if (!giveawaysManager) return lang('managerNotFound');

    const giveawayId = interaction.options.getString('id');
    let giveaway;

    if (giveawayId) {
      giveaway = giveawaysManager.giveaways.find(g => g.guildId == interaction.guild.id && g.messageId == giveawayId);

      if (!giveaway) return interaction.editReply(lang('notFound'));
      if (giveaway.hostedBy.slice(2, -1) !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.editReply(lang('notHost'));
    }

    const
      bonusEntries = interaction.options.getString('bonus_entries')?.split(' ').map(e => ({ [e.split(':')[0].replace(/[^/d]/g, '')]: e.split(':')[1] })),
      targetChannel = interaction.options.getChannel('channel') || interaction.channel,
      requiredRoles = interaction.options.getString('required_roles')?.replace(/[^\d]/g, '').split(' '),
      disallowedMembers = interaction.options.getString('exempt_member')?.replace(/[^\d]/g, '').split(' '),
      guildSettings = db.get('guildSettings'),
      reaction = interaction.options.getString('reaction') || guildSettings[interaction.guild.id]?.giveaway?.reaction || guildSettings.default.giveaway.reaction,
      components = [new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('buttonLabel'),
            url: '{this.messageURL}',
            style: ButtonStyle.Link
          })
        ]
      })],
      durationUnformatted = interaction.options.getString('duration') || interaction.options.getString('add_time') || 0,
      duration = getMilliseconds(durationUnformatted);

    if (typeof duration != 'number' && durationUnformatted) return interaction.editReply(lang('invalidTime'));


    switch (interaction.options.getSubcommand()) {
      case 'create': {
        const startOptions = {
          winnerCount: interaction.options.getNumber('winner_count'),
          prize: interaction.options.getString('prize'),
          hostedBy: interaction.user,
          botsCanWin: false,
          bonusEntries: { bonus: member => bonusEntries[member.id] },
          embedColor: parseInt(interaction.options.getString('embed_color')?.substring(1) ?? 0, 16) || guildSettings[interaction.guild.id]?.giveaway?.embedColor || guildSettings.default.giveaway.embedColor,
          embedColorEnd: parseInt(interaction.options.getString('embed_color_end')?.substring(1) ?? 0, 16) || guildSettings[interaction.guild.id]?.giveaway?.embedColorEnd || guildSettings.default.giveaway.embedColorEnd,
          reaction, duration,
          messages: {
            giveaway: lang('newGiveaway'),
            giveawayEnded: lang('giveawayEnded'),
            inviteToParticipate:
              `${interaction.options.getString('description')}\n\n` +
              (requiredRoles?.length ? lang('requiredRoles', `<@&${requiredRoles.join('>, <@&')}>\n`) : '') +
              (disallowedMembers?.length ? lang('disallowedMembers', `<@${disallowedMembers.join('< <@')}>\n`) : '') +
              lang('inviteToParticipate', reaction),
            winMessage: { content: lang('winMessage'), components },
            drawing: lang('drawing'),
            dropMessage: lang('dropMessage', reaction),
            embedFooter: lang('embedFooterText'),
            noWinner: lang('noWinner'),
            winners: lang('winners'),
            endedAt: lang('endedAt'),
            hostedBy: lang('hostedBy')
          },
          thumbnail: interaction.options.getString('thumbnail'),
          image: interaction.options.getString('image'),
          lastChance: guildSettings[interaction.guild.id]?.giveaway?.useLastChance || guildSettings.default.giveaway.useLastChance,
          isDrop: interaction.options.getBoolean('is_drop')
        };

        if (requiredRoles?.length || disallowedMembers?.length) startOptions.exemptMembers = member => !(member.roles.cache.some(r => requiredRoles?.includes(r.id)) && !disallowedMembers?.includes(member.id));

        const data = await giveawaysManager.start(targetChannel, startOptions);
        components[0].components[0].data.url = data.messageURL;

        return interaction.editReply({ content: lang('started'), components });
      }

      case 'end': {
        const data = await giveawaysManager.end(giveawayId);
        components[0].components[0].data.url = data.messageURL;

        return interaction.editReply({ content: lang('ended'), components });
      }

      case 'edit': {
        const editOptions = {
          addTime: duration,
          newBonusEntries: {},
          newWinnerCount: interaction.options.getNumber('winner_count'),
          newPrize: interaction.options.getString('prize'),
          newThumbnail: interaction.options.getString('thumbnail'),
          newImage: interaction.options.getString('image')
        };

        if (requiredRoles.length || disallowedMembers.length) editOptions.newExemptMembers = member => !(member.roles.cache.some(r => requiredRoles?.includes(r.id)) && !disallowedMembers.includes(member.id));
        if (bonusEntries.length) editOptions.newBonusEntries.bonus = member => bonusEntries[member.id];

        const data = await giveawaysManager.edit(giveawayId, editOptions);
        components[0].components[0].data.url = data.messageURL;

        return interaction.editReply({ content: lang('edited'), components });
      }

      case 'reroll': {
        const rerollOptions = {
          messages: {
            congrat: { content: lang('rerollWinners'), components },
            error: { content: lang('rerollNoWinner'), components }
          }
        };

        const data = await giveawaysManager.reroll(giveawayId, rerollOptions);
        components[0].components[0].data.url = data.messageURL;

        return interaction.editReply({ content: lang('rerolled'), components });
      }
    }

  }
}