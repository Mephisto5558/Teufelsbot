const { GiveawaysManager } = require('discord-giveaways');

module.exports = client => {
  const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
    getAllGiveaways() {
      return client.db.get('giveaways');
    }

    saveGiveaway(_, giveawayData) {
      client.db.push('giveaways', giveawayData);
      return true;
    }

    editGiveaway(messageId, giveawayData) {
      const data = (client.db.get('giveaways')).filter(e => e.messageId != messageId);
      data.push(giveawayData);

      client.db.set('giveaways', data);
      return true;
    }

    deleteGiveaway(messageId) {
      client.db.set('giveaways', (client.db.get('giveaways')).filter(e => e.messageId != messageId));
      return true;
    }
  };

  return new GiveawayManagerWithOwnDatabase(client);
};