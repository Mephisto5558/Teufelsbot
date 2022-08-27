module.exports = {
  name: 'blacklistuser',
  aliases: { prefix: [], slash: [] },
  description: 'blocks a user from using the bot',
  usage: 'PREFIX Command: blacklistuser <user id>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (message, lang, { db, application }) => {
    if (!message.args[0]) return;

    const oldData = db.get('botSettings');

    if (message.args[0] == 'off') {
      if (!oldData.blacklist.includes(message.args[1])) return message.customReply(lang('notFound'));

      oldData.blacklist = oldData.blacklist.filter(e => e != message.args[1]);
      db.set('botSettings', oldData);

      return message.customReply(lang('removed', message.args[1]))
    }

    if (message.args[0] == application.owner.id) return message.customReply(lang('cantBlacklistOwner'));

    oldData.blacklist.push(message.args[0]);
    db.set('botSettings', oldData);
    message.customReply(lang('saved', message.args[0]));
  }
}