const
  { EmbedBuilder, time, TimestampStyles, bold } = require('discord.js'),
  { commandMention } = require('#Utils'),
  { getTopChannelMembers } = require('./_utils');

/** @type {import('.').default} */
module.exports = {
  options: [{
    name: 'get',
    type: 'Subcommand',
    options: [{
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildText']
    }]
  }],

  async run(lang) {
    if (!this.inGuild()) return; // Type safeguard
    if (!this.guild.db.wordCounter?.enabled) {
      const command = this.client.slashCommands.get('setup');
      return this.customReply(lang('notEnabled', commandMention(`${command.name} ${this.command.name}`, command.id)));
    }

    const channel = this.options.getChannel('channel', false) ?? this.channel;

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', channel.name),
        description: lang('embedDescription', {
          enabledAt: time(new Date(Math.max(this.guild.db.wordCounter.enabledAt, this.channel.createdAt)), TimestampStyles.ShortDateTime),
          amount: bold(this.guild.db.wordCounter.channels[channel.id])
        })
      }),
      memberEmbed = new EmbedBuilder({
        title: lang('memberEmbedTitle'),
        description: lang('memberEmbedDescription', 10),
        fields: getTopChannelMembers(this.guild, channel.id, 10)
      });

    return this.customReply({ embeds: [embed, memberEmbed] });
  }
};