module.exports = {
  name: 'autopublish',
  permissions: { client: ['ManageGuild'], user: ['ManageGuild'] },
  cooldowns: { guild: 1000},
  slashCommand: true,
  prefixCommand: true,

  run: function (lang, { db }) {
    const setting = db.get('guildSettings')[this.guild.id]?.config?.autopublish;

    db.update('guildSettings', `${this.guid.id}.config.autopublish`, !setting);

    this.customReply(lang('success', setting ? lang('global.disabled') : lang('global.enabled')));
  }
};