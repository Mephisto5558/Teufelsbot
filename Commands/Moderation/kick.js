const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'kick',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
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
        description: lang('dmEmbedDescription', { guild: interaction.guild.name, mod: interaction.user.tag, reason }),
        color: Colors.Red
      }),
      resEmbed = new EmbedBuilder({
        title: lang('infoEmbedTitle'),
        description: lang('infoEmbedDescription', { mod: interaction.user.tag, reason }),
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
        resEmbed.data.description += lang('error', { user: target?.user?.tag ?? target.id, err: errorMsg });
        continue;
      }

      try { await target.send({ embeds: [embed] }) }
      catch { noMsg = true }

      await target.kick(reason);

      resEmbed.data.description += lang('success', target?.user?.tag ?? target.id);
      if (noMsg) resEmbed.data.description += lang('noDM');
    }

    if (resEmbed.data.description == lang('infoEmbedDescription', { user: interaction.user.tag, reason })) resEmbed.data.description += lang('noneFound');

    interaction.editReply({ embeds: [resEmbed] });
  }
}
