const { Command } = require('reconlx');

module.exports = new Command({
  name: 'blacklistuser',
  aliases: { prefix: [], slash: [] },
  description: 'blocks a user from using the bot',
  usage: 'PREFIX Command: blacklistuser <user id>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (message, lang, { db, functions, application }) => {
    if (!message.args[0]) return;

    const oldData = await db.get('botSettings');

    if (message.args[0] == 'off') {
      if (!oldData.blacklist.includes(message.args[1])) return functions.reply(lang('notFound'), message);
      db.set('botSettings', Object.merge(oldData, { blacklist: oldData.blacklist.filter(entry => entry != message.args[1]) }, 'overwrite'));

      return functions.reply(lang('removed', message.args[1]), message)
    }

    if (message.args[0] == application.owner.id) return functions.reply(lang('cantBlacklistOwner'), message);
    
    oldData.blacklist.push(message.args[0]);
    await db.set('botSettings', oldData);
    functions.reply(lang('saved', message.args[0]), message);
  }
})