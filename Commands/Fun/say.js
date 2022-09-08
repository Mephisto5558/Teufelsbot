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

  run: async (message, lang) => {
    const msg = message.args?.[0] || message.options?.getString('msg');
    const channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel;

    if (!message.member.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) return message.customReply(lang('noPerm'));
    if (!msg) return message.customReply(lang('noMsgProvided'));

    await channel.send(msg.replaceAll('/n', '\n'));
    message instanceof Message ? message.react('👍') : message.customReply(lang('global.messageSent'));
  }
}