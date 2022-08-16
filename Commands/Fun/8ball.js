const
  { Command } = require('reconlx'),
  { Message } = require('discord.js'),
  responseList = [
    'As I see it, yes.', 'It is certain.', 'It is decidedly so.', 'Most likely.', 'Yes.', 'Yes – definitely.', 'You may rely on it.', 'Outlook good.', 'Signs point to yes.', 'Without a doubt.',
    'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', 'Reply hazy, try again.',
    'Don’t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'
  ];

module.exports = new Command({
  name: '8ball',
  aliases: { prefix: [], slash: [] },
  description: 'Ask me a question',
  usage: '8ball <question>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'question',
    description: 'What do you want?',
    type: 'String',
    required: true
  }],

  run: async (message, lang, { functions }) => {
    if (message instanceof Message && !message.content) return functions.reply(lang('noQuestion'), message);

    message instanceof Message ? functions.reply(responseList.random(), message) : message.editReply(responseList.random());
  }
})