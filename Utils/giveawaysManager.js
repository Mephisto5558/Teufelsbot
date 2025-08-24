const { GiveawaysManager } = require('discord-giveaways');

module.exports = class GiveawaysManagerWithOwnDatabase extends GiveawaysManager {
  /** @type {import('.').GiveawaysManager['getAllGiveaways']} */
  getAllGiveaways() {
    return Object.values(this.client.db.get('guildSettings')).reduce((acc, v) => [...acc, ...Object.values(v.giveaway?.giveaways ?? {})], []);
  }

  /** @type {import('.').GiveawaysManager['saveGiveaway']} */
  async saveGiveaway(messageId, giveawayData) {
    await this.client.db.update('guildSettings', `${giveawayData.guildId}.giveaway.giveaways.${messageId}`, giveawayData);
    return true;
  }

  /** @type {import('.').GiveawaysManager['editGiveaway']} */
  editGiveaway = async (...args) => this.saveGiveaway(...args);

  /** @type {import('.').GiveawaysManager['deleteGiveaway']} */
  async deleteGiveaway(messageId) {
    const { guildId } = this.getAllGiveaways().find(e => e.messageId == messageId) ?? {};
    return guildId ? this.client.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${messageId}`) : true;
  }

  valueOf() {
    return this.constructor.name;
  }
};