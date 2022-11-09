module.exports = {
  name: 'gitpull',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    await require('../../Utils').gitpull();
    this.customReply(lang('success'));
  }
};