module.exports = {
  name: 'blacklistuser',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    if (!this.args[0]) return this.customReply(lang('noInput'));

    if (this.args[0] == 'off') {
      if (!this.client.settings.blacklist.includes(this.args[1])) return this.customReply(lang('notFound'));

      this.client.db.update('botSettings', 'blacklist', this.client.settings.blacklist.filter(e => e != this.args[1]));
      return this.customReply(lang('removed', this.args[1]));
    }

    if (this.args[0] == this.client.application.owner.id) return this.customReply(lang('cantBlacklistOwner'));

    this.client.db.update('botSettings', 'blacklist', (this.client.settings.blacklist || []).concat(this.args[0]));
    return this.customReply(lang('saved', this.args[0]));
  }
};