const { Constants, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'counting',
  permissions: { user: ['ManageChannels'] },
  cooldowns: { guild: 0, user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.TextBasedChannelTypes
  }], beta: true,

  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      counting = this.client.db.get('guildSettings')[this.guild.id]?.counting || {};

    if (counting[channel.id]) {
      delete counting[channel.id];
      this.client.db.update('guildSettings', `${this.guild.id}.counting`, counting);

      const embed = new EmbedBuilder({
        description: lang('removed.embedDescription'),
        footer: { text: lang('removed.by', this.user.tag) },
        color: Colors.Red
      });

      if (this.channel.id == channel.id) return this.reply({ embeds: [embed] });
      await channel.send({ embeds: [embed] });
      return this.customReply(lang('removed.success', channel.id));
    }

    this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel.id}`, { lastNumber: 0 });

    const embed = new EmbedBuilder({
      title: lang('added.embedTitle'),
      description: lang('added.embedDescription'),
      footer: { text: lang('added.by', this.user.tag) },
      color: Colors.Green
    });

    if (this.channel.id == channel.id) return this.reply({ embeds: [embed] });
    await channel.send({ embeds: [embed] });
    return this.customReply(lang('added.success', channel.id));
  }
};