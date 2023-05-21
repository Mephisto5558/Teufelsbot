const { GiveawaysManager } = require('discord-giveaways');

class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  getAllGiveaways() {
    return this.client.db.get('giveaways');
  }

  async saveGiveaway(_, giveawayData) {
    await this.client.db.push('giveaways', giveawayData);
    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    const data = this.client.db.get('giveaways').filter(e => e.messageId != messageId);
    data.push(giveawayData);

    await this.client.db.set('giveaways', data);
    return true;
  }

  async deleteGiveaway(messageId) {
    await this.client.db.set('giveaways', this.client.db.get('giveaways').filter(e => e.messageId != messageId));
    return true;
  }
}

module.exports = function giveawaysManager() { return new GiveawayManagerWithOwnDatabase(this); };