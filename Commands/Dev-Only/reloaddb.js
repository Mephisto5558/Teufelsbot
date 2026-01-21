const { Command, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.prefix],
  dmPermission: true,
  beta: true,

  async run(lang) {
    log.debug(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
});