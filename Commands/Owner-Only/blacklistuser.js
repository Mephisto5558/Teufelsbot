const { Command } = require('reconlx');

module.exports = new Command({
  name: 'blacklistuser',
  aliases: { prefix: [], slash: [] },
  description: 'blocks a user from using the bot',
  usage: 'PREFIX Command: blacklistuser <userID | @user>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
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
      if(message.args[0] == client.api.application.owner.id) return client.functions.reply('I cannot blacklist the set owner of the bot.', message);

      await client.db.push('blacklist', message.args[0]);
      client.functions.reply(`${message.args[0]} has been blacklisted from using the bot.`, message);
    }
  }
})