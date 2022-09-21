const { PermissionFlagsBits, Message } = require('discord.js');

module.exports = {
  name: 'say',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 200 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      type: 'String',
      required: true
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildText'],
    }
  ],

  run: async function (lang) {
    const msg = this.args?.[0] || this.options?.getString('msg');
    const channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel;

    if (!this.member.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) return this.customReply(lang('noPerm'));
    if (!msg) return this.customReply(lang('noMsgProvided'));

    await channel.send(msg.replaceAll('/n', '\n'));
    this instanceof Message ? this.react('👍') : this.customReply(lang('global.messageSent'));
  }
}