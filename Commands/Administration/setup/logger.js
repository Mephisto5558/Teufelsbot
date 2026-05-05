/** @import {CommandType} from '@mephisto5558/command' */

const
  { Constants, channelLink } = require('discord.js'),
  { CommandOption, OptionType } = require('@mephisto5558/command');

/** @type {['all', 'messageDelete', 'messageUpdate', 'voiceChannelActivity', 'sayCommandUsed']} */
const loggerActionTypes = ['all', 'messageDelete', 'messageUpdate', 'voiceChannelActivity', 'sayCommandUsed'];

/** @type {CommandOption<[CommandType.Slash]>} */
module.exports = new CommandOption({
  name: 'logger',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'action',
      type: OptionType.String,
      required: true,
      choices: loggerActionTypes
    },
    {
      name: 'channel',
      type: OptionType.Channel,
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'enabled', type: OptionType.Boolean }
  ],

  async run(lang) {
    const
      action = this.options.getString('action', true),
      channel = (
        this.options.getChannel('channel', false, Constants.GuildTextBasedChannelTypes)
        ?? this.guild.channels.cache.get(this.guild.db.config.logger?.[action]?.channel) ?? this.channel
      ).id,
      enabled = this.options.getBoolean('enabled') ?? (action == 'all' ? undefined : !this.guild.db.config.logger?.[action]?.enabled);

    if (action == 'all') {
      if (enabled == undefined) return this.editReply(lang('noEnabled'));
      for (const actionType of loggerActionTypes)
        if (actionType != 'all') await this.guild.updateDB(`config.logger.${actionType}`, { channel, enabled });
    }

    await this.guild.updateDB(`config.logger.${action}`, { channel, enabled });
    return this.editReply(lang(enabled ? 'enabled' : 'disabled', { channel: channelLink(channel), action: lang(`actions.${action}`) }));
  }
});