module.exports = {
  name: 'autopublish',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['ManageGuild'], user: ['ManageGuild'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,

  run: function (lang, { db }) {
    const oldData = db.get('guildSettings');
    const setting = oldData[this.guild.id]?.config?.autopublish;

    const newData = oldData.fMerge({ [this.guild.id]: { config: { autopublish: !setting } } });
    db.set('guildSettings', newData);

    this.customReply(lang('success', setting ? lang('global.disabled') : lang('global.enabled')));
  }
};