const { gitpull } = require('../../Utils');

/** @type {command<'prefix', false>}*/
module.exports = {
  name: 'gitpull',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    await gitpull();
    return this.customReply(lang('success'));
  }
};