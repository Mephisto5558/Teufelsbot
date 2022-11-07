const { GiveawaysManager } = require('discord-giveaways');

class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  getAllGiveaways() {
    return this.client.db.get('giveaways');
  }

  saveGiveaway(_, giveawayData) {
    this.client.db.push('giveaways', giveawayData);
    return true;
  }

  editGiveaway(messageId, giveawayData) {
    const data = this.db.get('giveaways').filter(e => e.messageId != messageId);
    data.push(giveawayData);

    this.client.db.set('giveaways', data);
    return true;
  }

  deleteGiveaway(messageId) {
    this.client.db.set('giveaways', this.client.db.get('giveaways').filter(e => e.messageId != messageId));
    return true;
  }
}

module.exports = function giveawaysManager() { return new GiveawayManagerWithOwnDatabase(this); };