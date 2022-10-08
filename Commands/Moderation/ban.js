const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'ban',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
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
    },
    {
      name: 'delete_days_of_messages',
      type: 'Number',
      minValue: 1,
      maxValue: 7
    }
    //{ name: 'duration', type: 'Number' }
  ],

  run: async function (lang) {
    const
      targets = new Set([...this.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = this.options.getString('reason'),
      days = this.options.getNumber('delete_days_of_messages'),
      embed = new EmbedBuilder({
        title: lang('dmEmbedTitle'),
        description: lang('dmEmbedDescription', { guild: this.guild.name, mod: this.user.tag, reason }),
        color: Colors.Red
      }),
      resEmbed = new EmbedBuilder({
        title: lang('infoEmbedTitle'),
        description: lang('infoEmbedDescription', { mod: this.user.tag, reason }),
        color: Colors.Red
      });

    for (const rawTarget of targets) {
      let target, errorMsg, noMsg;

      try { target = await this.guild.members.fetch(rawTarget); }
      catch { target = { id: rawTarget }; }

      if (target.id == this.member.id) errorMsg = lang('cantBanSelf');
      else if (target.roles && target.roles.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id)
        errorMsg = lang('noPerm', lang('global.you'));
      else if (target.bannable === false) errorMsg = lang('noPerm', lang('global.i'));

      if (errorMsg) {
        resEmbed.data.description += lang('error', { user: target?.user?.tag ?? target.id, err: errorMsg });
        continue;
      }

      try {
        if (!target.send) noMsg = true;
        else await target.send({ embeds: [embed] });
      }
      catch { noMsg = true; }

      await this.guild.bans.create(target.id, {
        reason, deleteMessageDays: days
      });

      resEmbed.data.description += lang('success', target?.user?.tag ?? target.id);
      if (noMsg) resEmbed.data.description += lang('noDM');
    }

    if (resEmbed.data.description == lang('infoEmbedDescription', { mod: this.user.tag, reason })) resEmbed.data.description += lang('noneFound');

    this.editReply({ embeds: [resEmbed] });
  }
};