import { ActivityType, ShardClientUtil } from 'discord.js';
import guildCreate from './guildCreate.ts';
import type { DiscordEvent } from './index.ts';

export default (async function clientReady(): Promise<void> {
  await this.application.emojis.fetch(); // required for ClientApplication#getEmoji() to work

  this.user.setActivity(this.settings.activity ?? { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');

  await this.guilds.fetch();
  for (const [guildId, guild] of Object.entries(this.db.get('guildSettings'))) {
    const shardId = this.shard ? ShardClientUtil.shardIdForGuildId(guildId, this.shard.count) : 0;
    if (!guild.leftAt && this.ws.shards.has(shardId) && !this.guilds.cache.has(guildId))
      void this.db.update('guildSettings', `${guildId}.leftAt`, Temporal.Now.instant());
  }

  for (const [, guild] of this.guilds.cache) {
    if (!('config' in guild.db)) void guildCreate.call(guild);

    if ('leftAt' in guild.db) void guild.deleteDB('leftAt');
  }
}) as DiscordEvent<'clientReady'>;