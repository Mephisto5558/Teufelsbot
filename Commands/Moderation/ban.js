const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'ban',
  aliases: { prefix: [], slash: [] },
  description: 'bans a member from the guild',
  usage: '',
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      description: 'Mention member(s) or put ID(s) in to ban them. Put a space between each target',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
      description: 'The target(s) will see the reason in DMs.',
      type: 'String',
      required: true
    },
    {
      name: 'delete_days_of_messages',
      description: 'Delete all messages of the targets of the last n days. max. 7d',
      type: 'Number',
      minValue: 1,
      maxValue: 7,
      required: false
    }
    /*{
      name: 'duration',
      description: 'How long want you to get the target banned, empty for permament',
      type: 'Number',
      required: false,
      disabled: true
    }*/
  ],

  run: async (interaction, lang) => {
    const
      targets = new Set([...interaction.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = interaction.options.getString('reason'),
      days = interaction.options.getNumber('delete_days_of_messages'),
      embed = new EmbedBuilder({
        title: lang('dmEmbedTitle'),
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

      if (target.id == interaction.member.id) errorMsg = lang('cantBanSelf');
      else if (target.roles && target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
        errorMsg = lang('noPerm', lang('global.you'));
      else if (target.bannable === false) errorMsg = lang('noPerm', lang('global.i'));

      if (errorMsg) {
        resEmbed.data.description += lang('error', target?.user?.tag ?? target.id, errorMsg);
        continue;
      }

      try {
        if (!target.send) noMsg = true;
        else await target.send({ embeds: [embed] })
      }
      catch { noMsg = true }

      await interaction.guild.bans.create(target.id, {
        reason: reason,
        deleteMessageDays: days
      });

      resEmbed.data.description += lang('success', target?.user?.tag ?? target.id);
      if (noMsg) resEmbed.data.description += lang('noDM');
    }

    if (resEmbed.data.description == lang('infoEmbedDescription', interaction.user.tag, reason)) resEmbed.data.description += lang('noneFound');

    interaction.editReply({ embeds: [resEmbed] });
  }
}