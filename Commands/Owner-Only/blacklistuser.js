module.exports = {
  name: 'blacklistuser',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang, { db, application }) {
    if (!this.args[0]) return;

    const oldData = db.get('botSettings');

    if (this.args[0] == 'off') {
      if (!oldData.blacklist.includes(this.args[1])) return this.customReply(lang('notFound'));

      oldData.blacklist = oldData.blacklist.filter(e => e != this.args[1]);
      db.set('botSettings', oldData);

      return this.customReply(lang('removed', this.args[1]));
    }

    if (this.args[0] == application.owner.id) return this.customReply(lang('cantBlacklistOwner'));

    oldData.blacklist.push(this.args[0]);
    db.set('botSettings', oldData);
    this.customReply(lang('saved', this.args[0]));
  }
};