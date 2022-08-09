const { Command } = require('reconlx');
const { Message } = require('discord.js');

module.exports = new Command({
  name: 'say',
  aliases: { prefix: [], slash: [] },
  description: 'Let me say something',
  usage: 'PREFIX Command: say ',
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

  run: async (message, { functions }) => {
    const msg = message.args?.[0] || message.options?.getString('msg');
    const channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel;

    if (!msg) {
      if (message instanceof Message) return functions.reply('You need to provide a message to send!', message);
      return message.editReply('You need to provide a message to send!');
    }

    await channel.send(msg.replace(/\/n/g, '\n'));

    message instanceof Message ? message.reply('Message sent!') : message.editReply('Message sent!');
  }
})
