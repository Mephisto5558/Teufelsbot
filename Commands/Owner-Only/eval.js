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

  run: async (message, client) => {
    if (!message.content) return;

    const msg = 'evaluated command:\n' + '```js\n' + message.content + '```\n';

    try {
      await eval(`(async _ => {${message.content}})()`);
      client.functions.reply(`${msg} without errors.`, message);
    }
    catch (err) {
      client.functions.reply(
        `${msg} with the following error:\n` +
        '```\n' + `${err.name}: ${err.message}\n` + '```', message
      );
    }
    finally {
      client.log(`evaluated command '${message.content}'`);
    }

  }
})