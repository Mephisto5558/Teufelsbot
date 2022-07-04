const { Command } = require('reconlx');

module.exports = new Command({
  name: 'say',
  aliases: [],
  description: 'Let me say something',
  usage: 'PREFIX Command: say ',
  permissions: { client: [], user: [] },
  cooldowns: { guild: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'msg',
      description: 'Type your message here, /n for new line',
      type: 'STRING',
      required: true
    },
    {
      name: 'channel',
      description: 'The channel the message gets sent to.',
      type: 'CHANNEL',
      channel_type: 'GUILD_TEXT',
      required: false
    }
  ],

  run: async (client, message, interaction) => {
    const msg = interaction?.options?.getString('msg') || message.args?.[0];
    const channel = interaction?.options.getChannel('channel') || interaction?.channel || message.channel;

    if (!msg) return client.functions.reply('You need to provide a message to send!', message);

    await channel.send(msg.replace(/\/n/g, '\n'));

    if (interaction) interaction.editReply('Message sent!');
    else message.reply('Message sent!');
  }
})