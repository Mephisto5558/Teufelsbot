module.exports = {
  name: 'gitpull',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    await require('../../Utils').gitpull();
    return this.customReply(lang('success'));
  }
};