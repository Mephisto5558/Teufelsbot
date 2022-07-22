const { Command } = require('reconlx');

module.exports = new Command({
  name: 'eval',
  aliases: { prefix: [], slash: [] },
  description: 'inject javascript code directly into the bot',
  usage: 'PREFIX Command: eval <code>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  prefixCommand: true,
  slashCommand: false,
  beta: true,

  run: async (client, message) => {
    if (!message.content) return;

    try {
      await eval(`(async _ => {${message.content}})()`);
      client.log(`evaluated command '${message.content}'`);

      client.functions.reply(
        'evaluated command:\n' +
        '```js\n' +
        message.content + '```', message
      )
    }
    catch (err) {
      return client.functions.reply('```\n' + err + '\n```', message);
    }
  }
})