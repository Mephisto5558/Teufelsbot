module.exports = {
  name: 'gitpull',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
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