module.exports = {
  name: 'gitpull',
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    await require('../../Utils/gitpull.js')();
    this.customReply(lang('success'));
  }
};