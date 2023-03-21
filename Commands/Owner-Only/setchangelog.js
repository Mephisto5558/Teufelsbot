module.exports = {
  name: 'setchangelog',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    this.client.db.update('botSettings', 'changelog', this.content);
    return this.reply(lang('success'));
  }
};