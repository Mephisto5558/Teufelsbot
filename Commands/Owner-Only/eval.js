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

  run: async (message, lang, client) => {
    if (!message.content) return;

    const msg = lang('finished', message.content);

    try {
      await eval(`(async _ => {${message.content}})()`);
      client.functions.reply(lang('success'), msg);
    }
    catch (err) {
      client.functions.reply(lang('error', msg, err.name, err.message), message);
    }
    finally {
      client.log(`evaluated command '${message.content}'`);
    }

  }
})