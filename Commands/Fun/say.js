const
  { Command } = require('reconlx'),
  { Message } = require('discord.js');

module.exports = new Command({
  name: 'say',
  aliases: { prefix: [], slash: [] },
  description: 'Let me say something',
  usage: 'PREFIX Command: say <msg> [channel]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 200 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      description: 'Type your message here, /n for new line',
      type: 'String',
      required: true
    },
    {
      name: 'channel',
      description: 'The channel the message gets sent to.',
      type: 'Channel',
      channelTypes: ['GuildText'],
      required: false
    }
  ],

  run: async (message, lang, { functions }) => {
    const msg = message.args?.[0] || message.options?.getString('msg');
    const channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel;

    if (!msg) return message instanceof Message ? functions.reply(lang('noMsgProvided'), message) : message.editReply(lang('noMsgProvided'));

    await channel.send(msg.replace(/\/n/g, '\n'));

    message instanceof Message ? message.reply(lang('global.messageSent')) : message.editReply(lang('global.messageSent'));
  }
})
