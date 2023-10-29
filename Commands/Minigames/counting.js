const { Constants, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'counting',
  permissions: { user: ['ManageChannels'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.TextBasedChannelTypes
  }],

  /**@this GuildInteraction|GuildMessage @param {lang}lang*/
  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      counting = this.guild.db.counting || {};

    if (counting[channel.id]) {
      await this.client.db.delete('guildSettings', `${this.guild.id}.counting.${channel.id}`);

      const embed = new EmbedBuilder({
        description: lang('removed.embedDescription'),
        footer: { text: lang('removed.by', this.user.username) },
        color: Colors.Red
      });

      if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });

      await channel.send({ embeds: [embed] });
      return this.customReply(lang('removed.success', channel.id));
    }

    const embed = new EmbedBuilder({
      title: lang('added.embedTitle'),
      description: lang('added.embedDescription'),
      footer: { text: lang('added.by', this.user.displayName) },
      color: Colors.Green
    });

    await this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel.id}`, { lastNumber: 0 });

    if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });
    await channel.send({ embeds: [embed] });
    
    return this.customReply(lang('added.success', channel.id));
  }
};