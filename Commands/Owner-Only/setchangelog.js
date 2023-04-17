module.exports = {
  name: 'setchangelog',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    this.client.db.update('botSettings', 'changelog', this.content?.replace('/n','\n'));
    return this.reply(lang('success'));
  }
};