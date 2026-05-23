/** @import {CommandType} from '@mephisto5558/command' */

const
  { ChannelType, Colors, EmbedBuilder, TimestampStyles, bold, time } = require('discord.js'),
  { CommandOption, ContextType, OptionType } = require('@mephisto5558/command'),
  { getTopChannelMembers } = require('./_utils');

/** @type {CommandOption<readonly [CommandType.Slash]>} */
module.exports = new CommandOption({
  name: 'channel',
  type: OptionType.SubcommandGroup,
  contexts: [ContextType.Guild],
  options: [{
    name: 'get',
    type: OptionType.Subcommand,
    options: [{
      name: 'channel',
      type: OptionType.Channel,
      channelTypes: [ChannelType.GuildText]
    }]
  }],

  async run(lang) {
    if (!this.guild.db.wordCounter?.enabled)
      return this.customReply(lang('notEnabled', this.client.commandManager.get('setup').mention(this.command.name)));

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