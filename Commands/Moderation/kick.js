const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'kick',
  aliases: { prefix: [], slash: [] },
  description: 'kicks a member from the server',
  usage: '',
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      description: 'Mention member(s) or put ID(s) in to kick them. Put a space between each target',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
      description: 'The target(s) will see the reason in DMs.',
      type: 'String',
      required: true
    }
  ],

  run: async (interaction, lang) => {
    const
      targets = new Set([...interaction.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = interaction.options.getString('reason'),
      embed = new EmbedBuilder({
        title: lang('infoEmbedTitle'),
        description: lang('dmEmbedDescription', interaction.guild.name, interaction.user.tag, reason),
        color: Colors.Red
      }),
      resEmbed = new EmbedBuilder({
        title: lang('infoEmbedTitle'),
        description: lang('infoEmbedDescription', interaction.user.tag, reason),
        color: Colors.Red
      });

    for (const rawTarget of targets) {
      let target, errorMsg, noMsg;

      try { target = await interaction.guild.members.fetch(rawTarget) }
      catch { target = { id: rawTarget } }

      if (target.id == interaction.member.id) errorMsg = lang('cantKickSelf');
      else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
        errorMsg = lang('noPerm', lang('global.you'));
      else if (!target.kickable) errorMsg = lang('noPerm', lang('global.i'));

      if (errorMsg) {
        resEmbed.data.description += lang('error', target?.user?.tag ?? target.id, errorMsg);
        continue;
      }

      try { await target.send({ embeds: [embed] }) }
      catch { noMsg = true }

      await target.kick(reason);

      resEmbed.data.description += lang('success', target?.user?.tag ?? target.id);
      if (noMsg) resEmbed.data.description += lang('noDM');
    }

    if (resEmbed.data.description == lang('infoEmbedDescription', interaction.user.tag, reason)) resEmbed.data.description += lang('noneFound');

    interaction.editReply({ embeds: [resEmbed] });

  }
})
