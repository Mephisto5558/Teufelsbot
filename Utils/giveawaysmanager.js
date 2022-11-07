const { GiveawaysManager } = require('discord-giveaways');

class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  constructor({ db }) {
    super(...arguments);
    this.db = db;
  }

  getAllGiveaways() {
    return this.db.get('giveaways');
  }

  saveGiveaway(_, giveawayData) {
    this.db.push('giveaways', giveawayData);
    return true;
  }

  editGiveaway(messageId, giveawayData) {
    const data = this.db.get('giveaways').filter(e => e.messageId != messageId);
    data.push(giveawayData);

    this.db.set('giveaways', data);
    return true;
  }

  deleteGiveaway(messageId) {
    this.db.set('giveaways', this.db.get('giveaways').filter(e => e.messageId != messageId));
    return true;
  }
}

module.exports = function giveawaysManager() { return new GiveawayManagerWithOwnDatabase(this); };