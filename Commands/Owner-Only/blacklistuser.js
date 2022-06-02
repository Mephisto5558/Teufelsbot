const { Command } = require('reconlx');

module.exports = new Command({
  name: 'blacklistuser',
  alias: [],
  description: 'blocks a user from using the bot',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message) => {
    if(!message.args[0] && !message.args[0]) return;
    if(message.args[0] == 'off') {
      let oldData = client.db.get('blacklist');
      let newData = oldData.filter(entry => entry != message.args[1]);

      client.db.set('blacklist', newData);
    }

    client.db.push('blacklist', message.args[0]);
    client.functions.reply(`${message.args[0]} has been blacklisted from using the bot.`, message);
  }
})