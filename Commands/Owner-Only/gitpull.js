module.exports = {
  name: 'gitpull',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async function (lang) {
    await require('../../Website/custom/git/pull.js').run();
    this.customReply(lang('success'));
  }
}