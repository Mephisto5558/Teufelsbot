import { GiveawaysManager, type GiveawayData } from 'discord-giveaways';

export default class GiveawaysManagerWithOwnDatabase extends GiveawaysManager {
  override getAllGiveaways(): GiveawayData[] {
    return Object.values(this.client.db.get('guildSettings')).reduce((acc, v) => [...acc, ...Object.values(v.giveaway?.giveaways ?? {})], []);
  }

  override async saveGiveaway(messageId: Snowflake, giveawayData: GiveawayData): Promise<true> {
    await this.client.db.update('guildSettings', `${giveawayData.guildId}.giveaway.giveaways.${messageId}`, giveawayData);
    return true;
  }

  override editGiveaway: GiveawaysManagerWithOwnDatabase['saveGiveaway'] = async (...args) { return this.saveGiveaway(...args); }

  override async deleteGiveaway(messageId: Snowflake): Promise<boolean> {
    const { guildId } = this.getAllGiveaways().find(e => e.messageId == messageId) ?? {};
    return guildId ? this.client.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${messageId}`) : true;
  }

  override valueOf(): 'GiveawaysManagerWithOwnDatabase' {
    return 'GiveawaysManagerWithOwnDatabase';
  }
};