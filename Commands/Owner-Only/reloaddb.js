module.exports = {
  name: 'reloaddb',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    this.client.log(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
};