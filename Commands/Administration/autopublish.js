module.exports = {
  name: 'autopublish',
  permissions: { client: ['ManageGuild'], user: ['ManageGuild'] },
  cooldowns: { guild: 1000},
  slashCommand: true,
  prefixCommand: true,

  run: function (lang) {
    const setting = this.guild.db.config?.autopublish;

    this.client.db.update('guildSettings', `${this.guid.id}.config.autopublish`, !setting);

    return this.customReply(lang('success', setting ? lang('global.disabled') : lang('global.enabled')));
  }
};