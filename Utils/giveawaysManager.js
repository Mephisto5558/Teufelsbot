const { GiveawaysManager } = require('discord-giveaways');

module.exports = class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  getAllGiveaways() {
    return Object.entries(this.client.db.get('guildSettings')).reduce((acc, [k, v]) => {
      const giveaways = Object.values(v.giveaway?.giveaways ?? {});
      if (k != 'default' && giveaways.length) acc = [...acc, ...giveaways];
      return acc;
    }, []);
  }

  /**
   * @param {import('discord.js').Snowflake}messageId
   * @param {import('discord-giveaways').Giveaway}giveawayData*/
  async saveGiveaway(messageId, giveawayData) {
    await this.client.db.update('guildSettings', `${giveawayData.guildId}.giveaway.giveaways.${messageId}`, giveawayData);
    return true;
  }

  editGiveaway = this.saveGiveaway;

  /** @param {import('discord.js').Snowflake}messageId*/
  async deleteGiveaway(messageId) {
    const guildId = Object.entries(this.client.db.get('guildSettings')).find(([,v]) => v.giveaway?.giveaways?.find(e => e.messageId == messageId))[0];
    await this.client.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${messageId}`);
    return true;
  }
};