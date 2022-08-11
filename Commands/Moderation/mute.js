const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'mute',
  aliases: { prefix: ['timeout'], slash: ['timeout'] },
  description: 'timeouts a member of a given time (max 28d), default 1h',
  usage: 'Duration options: you need to use at least one.',
  permissions: { client: ['EmbedLinks', 'MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      description: 'who you want to mute',
      type: 'User',
      required: true,
    },
    {
      name: 'reason',
      description: 'The member will see the reason in a DM.',
      type: 'String',
      required: true
    },
    {
      name: 'duration_days',
      description: 'for how much days you want to mute the target',
      type: 'Number',
      maxValue: 27,
      required: false
    },
    {
      name: 'duration_hours',
      description: 'for how much hours you want to mute the target',
      type: 'Number',
      maxValue: 23,
      required: false
    },
    {
      name: 'duration_minutes',
      description: 'for how much minutes you want to mute the target',
      type: 'Number',
      maxValue: 59,
      required: false
    },
    {
      name: 'duration_seconds',
      description: 'for how much seconds you want to mute the target',
      type: 'Number',
      maxValue: 59,
      required: false
    }
  ],

  run: async (interaction, lang) => {

    const
      target = interaction.options.getMember('target'),
      reason = interaction.options.getString('reason'),
      date = new Date(),
      oldDate = new Date(date);

    let errorMsg, noMsg;

    if (!target) errorMsg = lang('notFound');
    else if (target.id === interaction.member.id) errorMsg = lang('cantMuteSelf');
    else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
      errorMsg = lang('noPerm', lang('global.you'));
    else if (!target.moderatable) errorMsg = lang('noPerm', lang('global.i'));

    if (errorMsg) return interaction.editReply(errorMsg);

    for (const option of interaction.options.data) {
      switch (option.name.replace('duration_', '')) {
        case 'days': date.setDate(date.getDate() + (option.value > 27 ? 27 : option.value)); break;
        case 'hours': date.setTime(date.getTime() + (option.value > 23 ? 23 : option.value) * 3600000); break;
        case 'minutes': date.setTime(date.getTime() + (option.value > 59 ? 59 : option.value) * 60000); break;
        case 'seconds': date.setTime(date.getTime() + (option.value > 59 ? 59 : option.value) * 1000); break;
      }
    }

    if (date == oldDate) date.setTime(date.getTime() + 3600000); //1h

    try { await target.disableCommunicationUntil(date.getTime(), `${reason}, moderator ${interaction.user.tag}`) }
    catch (err) { return interaction.editReply(lang('error', err)) }

    const embed = new EmbedBuilder({
      title: lang('dmEmbedTitle'),
      description: lang('dmEmbedDescription',
        interaction.guild.name, interaction.user.tag,
        Math.round(target.communicationDisabledUntilTimestamp / 1000), reason
      ),
      color: Colors.Red
    });

    try { await target.send({ embeds: [embed] }) }
    catch { noMsg = true }

    embed.data.title = lang('infoEmbedTitle');
    embed.data.description = lang('infoEmbedDescription', target.user.tag, reason, Math.round(target.communicationDisabledUntilTimestamp / 1000));
    if (noMsg) embed.data.description += lang('noDm');

    interaction.editReply({ embeds: [embed] });

  }
})
