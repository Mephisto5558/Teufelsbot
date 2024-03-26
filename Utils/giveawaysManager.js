const { GiveawaysManager } = require('discord-giveaways');

module.exports = class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  /** @returns {import('discord-giveaways').GiveawayData[]} */
  getAllGiveaways() {
    return Object.values(this.client.db.get('guildSettings'))
      .reduce((acc, v) => v.giveaway && 'giveaways' in v.giveaway ? [...acc, ...Object.values(v.giveaway.giveaways)] : acc, []);
  }

  /**
   * @param {import('discord.js').Snowflake}messageId
   * @param {import('discord-giveaways').Giveaway}giveawayData*/ // `import('discord-giveaways').GiveawayData` makes everything `any` for some reason
  async saveGiveaway(messageId, giveawayData) {
    await this.client.db.update('guildSettings', `${giveawayData.guildId}.giveaway.giveaways.${messageId}`, giveawayData);
    return true;
  }

  editGiveaway = this.saveGiveaway;

  /** @param {import('discord.js').Snowflake}messageId*/
  deleteGiveaway(messageId) {
    const { guildId } = this.getAllGiveaways().find(e => e.messageId == messageId) ?? {};
    return guildId ? this.client.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${messageId}`) : true;
  }
};