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

  run: async ({ db, functions, application }, message) => {
    if (!message.args[0]) return;

    if (message.args[0] == 'off') {
      const oldData = await db.get('blacklist');
      const newData = oldData.filter(entry => entry != message.args[1]);

      if (oldData.length == newData.length) return functions.reply('Found no entry for this id.', message);

      await db.set('blacklist', newData);
      return functions.reply(`The blacklist entry for \`${message.args[1]}\` has been removed.`, message);
    }

    if (message.args[0] == application.owner.id) return functions.reply('I cannot blacklist the owner of the bot.', message);

    await db.push('blacklist', message.args[0]);
    functions.reply(`${message.args[0]} has been blacklisted from using the bot.`, message);
  }
})