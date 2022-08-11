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

  run: async (message, lang, { db, functions, application }) => {
    if (!message.args[0]) return;

    const oldData = await db.get('botSettings');
    let newData;

    if (message.args[0] == 'off') {
      if (!oldData.blacklist.includes(message.args[1])) return functions.reply(lang('notFound'), message);

      newData = Object.merge(oldData, { blacklist: oldData.blacklist.filter(entry => entry != message.args[1]) });
    }
    else if (message.args[0] == application.owner.id) return functions.reply(lang('cantBlacklistOwner'), message);
    else oldData.blacklist.push(message.args[0]);

    await db.set('botSettings', newData || oldData);
    functions.reply(newData ? lang('removed', message.args[1]) : lang('saved', message.args[0]), message);
  }
})