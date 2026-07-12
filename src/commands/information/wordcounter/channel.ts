import type {CommandType} from '@mephisto5558/command';

import { ChannelType, Colors, EmbedBuilder, TimestampStyles, bold, time } from 'discord.js';
import { CommandOption, ContextType, OptionType } from '@mephisto5558/command';
import { timeFormatter: { msInSecond } } from '#utils';
import { getTopChannelMembers } from './_utils';

/** @type {CommandOption<readonly [CommandType.Slash]>} */
export default new CommandOption({
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
          enabledAt: time(
            Math.floor(Math.max(this.guild.db.wordCounter.enabledAt?.epochMilliseconds, this.channel.createdTimestamp) / msInSecond),
            TimestampStyles.ShortDateShortTime
          ),
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