const { Command } = require('reconlx');

module.exports = new Command({
  name: 'eval',
  aliases: [],
  description: 'inject javascript code directly into the bot',
  usage: 'PREFIX Command: eval <code>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  prefixCommand: true,
  slashCommand: false,
  beta: true,

  run: async (client, message) => {
    if(!message.content) return;
    
    try {
      await eval(message.content);
      client.log(`evaluated command '${message.content}'`);
    }
    catch (err) {
      return client.functions.reply('```\n' + err + '\n```', message);
    }

    client.functions.reply(
      'evaluated command:\n' +
      '```javascript\n' +
      message.content + '```', message
    )

  }
})