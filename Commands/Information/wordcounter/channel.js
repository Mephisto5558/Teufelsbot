const
  { ChannelType, Colors, EmbedBuilder, TimestampStyles, bold, time } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command'),
  { commandMention } = require('#Utils'),
  { getTopChannelMembers } = require('./_utils');

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'channel',
  type: 'SubcommandGroup',
  dmPermission: false,
  options: [{
    name: 'get',
    type: 'Subcommand',
    options: [{
      name: 'channel',
      type: 'Channel',
      channelTypes: [ChannelType.GuildText]
    }]
  }],

  async run(lang) {
    if (!this.guild.db.wordCounter?.enabled) {
      const command = this.client.slashCommands.get('setup');
      return this.customReply(lang('notEnabled', commandMention(`${command.name} ${this.command.name}`, command.id)));
    }

    const
      channel = this.options.getChannel('channel', false, [ChannelType.GuildText]) ?? this.channel,
      embed = new EmbedBuilder({
        title: lang('embedTitle', channel.name),
        description: lang('embedDescription', {
          enabledAt: time(new Date(Math.max(this.guild.db.wordCounter.enabledAt, this.channel.createdAt)), TimestampStyles.ShortDateShortTime),
          amount: bold(this.guild.db.wordCounter.channels[channel.id] ?? 0)
        }),
        color: Colors.Blurple
      }),
      memberEmbed = new EmbedBuilder({
        title: lang('memberEmbedTitle'),
        description: lang('memberEmbedDescription', 10),
        color: Colors.Blurple,
        fields: getTopChannelMembers(this.guild, channel.id, 10)
      });

    return this.customReply({ embeds: [embed, memberEmbed] });
  }
});