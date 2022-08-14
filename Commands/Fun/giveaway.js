const
  { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js'),
  { Command } = require('reconlx'),
  ms = require('ms');

module.exports = new Command({
  name: 'giveaway',
  aliases: { prefix: [], slash: [] },
  description: 'Giveaway Utilitys',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: ['ManageMessages'] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true, beta: true,
  options: [
    {
      name: 'create',
      description: 'Create a new giveaway.',
      type: 'Subcommand',
      options: [
        {
          name: 'prize',
          description: 'the prize you are giving away',
          type: 'String',
          required: true
        },
        {
          name: 'description',
          description: 'the giveaway embed description',
          type: 'String',
          required: true
        },
        {
          name: 'duration',
          description: 'the giveaway duration: eg 1w3d2h5min',
          type: 'String',
          required: true
        },
        {
          name: 'winner_count',
          description: 'The number of winners',
          type: 'Number',
          minValue: 1,
          required: true
        },
        {
          name: 'channel',
          description: 'the channel the giveaway should get created in',
          type: 'String',
          required: false
        },
        {
          name: 'reaction',
          description: 'the emoji users have to react with to participate',
          type: 'String',
          required: false
        },
        {
          name: 'thumbnail',
          description: 'the thumbnail url to use',
          type: 'String',
          required: false
        },
        {
          name: 'image',
          description: 'the image url to use',
          type: 'String',
          required: false
        },
        {
          name: 'exempt_members',
          description: 'Members who are not allowed to participate in this giveaway',
          type: 'String',
          required: false
        },
        {
          name: 'required_roles',
          description: 'Only members with one of this roles will be able to participate.',
          type: 'String',
          required: false
        },
        {
          name: 'bonus_entries',
          description: 'a list of members/roles with the amount of bonus entries: eg. @Premium:5 @Normal:1',
          type: 'String',
          required: false
        },
        {
          name: 'embed_color',
          description: "The hex color of the embed while the giveaway is running.",
          type: 'String',
          required: false
        },
        {
          name: 'embed_color_end',
          description: "The hex color of the embed after the giveaway has ended.",
          type: 'String',
          required: false
        }
      ]
    },
    {
      name: 'end',
      description: 'end a running giveaway',
      type: 'Subcommand',
      options: [{
        name: 'id',
        description: 'the id of the giveaway embed',
        type: 'String',
        required: true
      }]
    },
    {
      name: 'edit',
      description: 'edit a running giveaway',
      type: 'Subcommand',
      options: [
        {
          name: 'id',
          description: 'the id of the giveaway embed',
          type: 'String',
          required: true
        },
        {
          name: 'add_time',
          description: 'the number of time added to the giveaway duration. eg 2h12min or -1h10min',
          type: 'String',
          required: false
        },
        {
          name: 'winner_count',
          description: 'the new number of winners',
          type: 'String',
          minValue: 1,
          required: false
        },
        {
          name: 'prize',
          description: 'the new prize you are giving away',
          type: 'String',
          required: false
        },
        {
          name: 'thumbnail',
          description: 'the new thumbnail url to use',
          type: 'String',
          required: false
        },
        {
          name: 'image',
          description: 'the new image url to use',
          type: 'String',
          required: false
        },
        {
          name: 'exempt_members',
          description: 'Members who are not allowed to participate in this giveaway',
          type: 'String',
          required: false
        },
        {
          name: 'required_roles',
          description: 'Only members with one of this roles will be able to participate.',
          type: 'String',
          required: false
        },
        {
          name: 'bonus_entries',
          description: 'a new list of members/roles with the amount of bonus entries: eg. @Premium:5 @Normal:1',
          type: 'String',
          required: false
        }
      ]
    },
    {
      name: 'reroll',
      description: 'reroll a ended giveaway',
      type: 'Subcommand',
      options: [{
        name: 'id',
        description: 'the id of the giveaway embed',
        type: 'String',
        required: true
      }]
    }
  ],

  run: async (interaction, lang, { db, giveawaysManager }) => {
    const giveawayId = interaction.options.getString('id');
    let giveaway;

    if (giveawayId) {
      giveaway = giveawaysManager.giveaways.find(g => g.guildId == interaction.guild.id && g.messageId == giveawayId);

      if (!giveaway) return interaction.editReply(lang('notFound'));
      if (giveaway.hostedBy.slice(2, -1) !== interaction.user.id && interaction.member.permissions.missing(PermissionFlagsBits.Administrator))
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
      durationUnformatted = interaction.options.getString('duration') || interaction.options.getString('add_time'),
      duration = ms(durationUnformatted);

    if (!duration && durationUnformatted) return interaction.editReply('The provided duration/add_time value is invalid!');


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
              (requiredRoles?.length? lang('requiredRoles', `<@&${requiredRoles.join('>, <@&')}>\n`) :'') +
              (disallowedMembers?.length? lang('disallowedMembers', `<@${disallowedMembers.join('< <@')}>\n`): '') +
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
})