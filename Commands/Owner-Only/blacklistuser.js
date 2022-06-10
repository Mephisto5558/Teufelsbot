const { Command } = require('reconlx');

module.exports = new Command({
  name: 'blacklistuser',
  alias: [],
  description: 'blocks a user from using the bot',
  usage: 'PREFIX Command: blacklistuser <userID>',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    if (!message.args[0]) return;
    message.args = message.content.replace(/[<@>]/g, '').split(' ');

    if (message.args[0] == 'off') {
      const oldData = await client.db.get('blacklist');
      const newData = oldData.filter(entry => entry != message.args[1]);

      await client.db.set('blacklist', newData);
      client.functions.reply(`The blacklist entry about ${message.args[1]} has been deleted.`, message);
    }
    else {
      await client.db.push('blacklist', message.args[0]);
      client.functions.reply(`${message.args[0]} has been blacklisted from using the bot.`, message);
    }
  }
})