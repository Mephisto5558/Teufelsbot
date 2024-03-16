const { Constants, EmbedBuilder, Colors } = require('discord.js');
const { getTargetChannel } = require('../../Utils');

/** @type {command<'both'>}*/
module.exports = {
  permissions: { user: ['ManageChannels'] },
  cooldowns: { channel: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes
  }],

  run: async function (lang) {
    const
      counting = this.guild.db.counting ?? {},

      /** @type {import('discord.js').GuildTextBasedChannel}*/
      channel = getTargetChannel.call(this, { returnSelf: true });


    if (counting[channel.id]) {
      await this.client.db.delete('guildSettings', `${this.guild.id}.counting.${channel.id}`);

      const embed = new EmbedBuilder({
        description: lang('removed.embedDescription'),
        footer: { text: lang('removed.by', this.user.tag) },
        color: Colors.Red
      });

      if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });

      await channel.send({ embeds: [embed] });
      return this.customReply(lang('removed.success', channel.id));
    }

    const embed = new EmbedBuilder({
      title: lang('added.embedTitle'),
      description: lang('added.embedDescription'),
      footer: { text: lang('added.by', this.user.tag) },
      color: Colors.Green
    });

    await this.client.db.update('guildSettings', `${this.guild.id}.counting.${channel.id}`, { lastNumber: 0 });

    if (this.channel.id == channel.id) return this.customReply({ embeds: [embed] });
    await channel.send({ embeds: [embed] });

    return this.customReply(lang('added.success', channel.id));
  }
};