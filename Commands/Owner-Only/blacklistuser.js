module.exports = {
  name: 'blacklistuser',
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang, { db, application }) {
    if (!this.args[0]) return this.customReply(lang('noInput'));

    const data = db.get('botSettings');

    if (this.args[0] == 'off') {
      if (!data.blacklist.includes(this.args[1])) return this.customReply(lang('notFound'));

      data.blacklist = data.blacklist.filter(e => e != this.args[1]);
      db.set('botSettings', data);

      return this.customReply(lang('removed', this.args[1]));
    }

    if (this.args[0] == application.owner.id) return this.customReply(lang('cantBlacklistOwner'));

    data.blacklist.push(this.args[0]);
    db.set('botSettings', data);
    this.customReply(lang('saved', this.args[0]));
  }
};