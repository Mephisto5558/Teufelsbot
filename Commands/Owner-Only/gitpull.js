module.exports = {
  name: 'gitpull',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message @param {lang}lang*/
  run: async function (lang) {
    await require('../../Utils').gitpull();
    return this.customReply(lang('success'));
  }
};