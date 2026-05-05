/** @import {CommandType} from '@mephisto5558/command' */

const
  { Colors, EmbedBuilder, TimestampStyles, bold, time } = require('discord.js'),
  { CommandOption, DMPermType, OptionType } = require('@mephisto5558/command'),
  { getTopChannels, getTopMembers } = require('./_utils');

/** @type {CommandOption<[CommandType.Slash]>} */
module.exports = new CommandOption({
  name: 'guild',
  type: OptionType.SubcommandGroup,
  dmPermission: DMPermType.CanBeDM,
  options: [{
    name: 'get',
    type: OptionType.Subcommand,
    options: [{
      name: 'guild_id',
      type: OptionType.String,
      autocompleteOptions: function () {
        return this.client.guilds.cache
          .filter(e => e.members.cache.has(this.user.id))
          .map(e => ({ name: e.name, value: e.id }));
      },
      strictAutocomplete: true
    }]
  }],

  async run(lang) {
    const guild = this.client.guilds.cache.get(this.options.getString('guild_id') ?? this.guild?.id);
    if (!guild) return this.customReply(lang('invalidGuild'));
    if (!guild.db.wordCounter?.enabled)
      return this.customReply(lang('notEnabled', this.client.commandManager.get('setup').mention(this.command.name)));

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', guild.name),
        thumbnail: { url: guild.iconURL() },
        description: lang('embedDescription', {
          enabledAt: time(guild.db.wordCounter.enabledAt, TimestampStyles.ShortDateShortTime),
          amount: bold(guild.db.wordCounter.sum)
        })
      }),
      channelEmbed = new EmbedBuilder({
        title: lang('channelEmbedTitle'),
        description: lang('channelEmbedDescription', 10),
        color: Colors.Blurple,
        fields: getTopChannels(guild, 10)
      }),
      memberEmbed = new EmbedBuilder({
        title: lang('memberEmbedTitle'),
        description: lang('memberEmbedDescription', 10),
        color: Colors.Blurple,
        fields: getTopMembers(guild, 10)
      });

    return this.customReply({ embeds: [embed, channelEmbed, memberEmbed] });
  }
});