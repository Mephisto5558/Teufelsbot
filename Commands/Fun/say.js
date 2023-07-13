const
  { Constants, PermissionFlagsBits, Message } = require('discord.js'),
  { logSayCommandUse } = require('../../Utils');

module.exports = {
  name: 'say',
  cooldowns: { user: 200 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      type: 'String',
      maxLength: 2000,
      required: true
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.TextBasedChannelTypes,
    }
  ],

  run: async function (lang) {
    const
      msg = this.args?.[0] || this.options?.getString('msg'),
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel;

    if (!this.member.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) return this.customReply(lang('noPerm'));
    if (!msg) return this.customReply(lang('noMsgProvided'));

    const sentMessage = await channel.send(msg.replaceAll('/n', '\n'));
    await (this instanceof Message ? this.react('👍') : this.customReply(lang('global.messageSent')));

    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
};