const
  { Constants, channelLink } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command'),
  loggerActionTypes = ['messageDelete', 'messageUpdate', 'voiceChannelActivity', 'sayCommandUsed'];

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'logger',
  type: 'Subcommand',
  options: [
    {
      name: 'action',
      type: 'String',
      required: true,
      choices: ['all', ...loggerActionTypes]
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'enabled', type: 'Boolean' }
  ],

  async run(lang) {
    const

      /** @type {'all' | 'messageDelete' | 'messageUpdate' | 'voiceChannelActivity' | 'sayCommandUsed'} */
      action = this.options.getString('action', true),
      channel = (
        this.options.getChannel('channel', false, Constants.GuildTextBasedChannelTypes)
        ?? this.guild.channels.cache.get(this.guild.db.config.logger?.[action]?.channel) ?? this.channel
      )?.id,
      enabled = this.options.getBoolean('enabled') ?? (action == 'all' ? undefined : !this.guild.db.config.logger?.[action]?.enabled);

    if (!channel) return this.editReply(lang('noChannel'));
    if (action == 'all') {
      if (enabled == undefined) return this.editReply(lang('noEnabled'));
      for (const actionType of loggerActionTypes) await this.guild.updateDB(`config.logger.${actionType}`, { channel, enabled });
    }

    await this.guild.updateDB(`config.logger.${action}`, { channel, enabled });
    return this.editReply(lang(enabled ? 'enabled' : 'disabled', { channel: channelLink(channel), action: lang(`actions.${action}`) }));
  }
});