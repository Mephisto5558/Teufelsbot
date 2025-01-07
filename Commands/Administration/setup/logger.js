const
  { Constants, channelLink } = require('discord.js'),
  loggerActionTypes = ['messageDelete', 'messageUpdate', 'voiceChannelActivity', 'sayCommandUsed'];

module.exports = {
  /** @type {NonNullable<command<'slash'>['options']>[number]['options']} */
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

  /** @type {command<'slash'>['run']} */
  async run(lang) {
    const
      action = this.options.getString('action', true),
      channel = (this.options.getChannel('channel') ?? this.guild.channels.cache.get(this.guild.db.config.logger?.[action].channel))?.id ?? this.channel?.id,
      enabled = this.options.getBoolean('enabled') ?? (action == 'all' ? undefined : !this.guild.db.config.logger?.[action].enabled);

    if (channel == undefined) return this.editReply(lang('noChannel'));
    if (action == 'all') {
      if (enabled == undefined) return this.editReply(lang('noEnabled'));
      for (const actionType of loggerActionTypes) await this.guild.updateDB(`config.logger.${actionType}`, { channel, enabled });
    }

    await this.guild.updateDB(`config.logger.${action}`, { channel, enabled });
    return this.editReply(lang(enabled ? 'enabled' : 'disabled', { channel: channelLink(channel), action: lang(`actions.${action}`) }));
  }
};