module.exports = {
  name: 'autopublish',
  aliases: { prefix: [], slash: [] },
  description: 'automatically publishes everything anyone in an announcement channel says.',
  usage:
    'This command publishes all messages send in announcement channels automatically.\n' +
    'This is a toggle.',
  permissions: { client: ['ManageGuild'], user: ['ManageGuild'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, lang, { db }) => {
    const oldData = db.get('guildSettings');
    const setting = oldData[message.guild.id]?.config?.autopublish;

    const newData = oldData.fMerge({ [message.guild.id]: { config: { autopublish: !setting } } })
    db.set('guildSettings', newData);

    message.customreply(lang('success', setting ? lang('global.disabled') : lang('global.enabled')));
  }
}