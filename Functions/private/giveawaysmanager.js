const { GiveawaysManager } = require('discord-giveaways');

module.exports = client => {
  const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
    async getAllGiveaways() {
      return client.db.get('giveaways');
    }

    async saveGiveaway(_, giveawayData) {
      client.db.push('giveaways', giveawayData);
      return true;
    }

    async editGiveaway(messageId, giveawayData) {
      const data = (client.db.get('giveaways')).filter(e => e.messageId != messageId);
      data.push(giveawayData);
      
      client.db.set('giveaways', data);
      return true;
    }

    async deleteGiveaway(messageId) {
      client.db.set('giveaways', (client.db.get('giveaways')).filter(e => e.messageId != messageId));
      return true;
    }
  }

  return new GiveawayManagerWithOwnDatabase(client);
}