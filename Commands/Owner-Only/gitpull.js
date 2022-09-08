module.exports = {
  name: 'gitpull',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, lang) => {
    await require('../../Website/custom/git/pull.js').run();
    message.customReply(lang('success'));
  }
}