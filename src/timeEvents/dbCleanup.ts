import { SnowflakeUtil } from 'discord.js';
import { writeFile } from 'node:fs/promises';
import type { CronJob } from './index.ts';

/** @returns Unix timestamp in ms */
const getOneMonthAgo = (): number => Temporal.Now.instant().subtract({ months: 1 }).epochMilliseconds;


/** Writes the data to a file. */
async function backupDBs(this: Client) {
  const data = Object.fromEntries(this.db.reduce().map(e => [e.key, e.value]));

  return writeFile(`dbbackup_${Temporal.Now.plainDateISO().toString()}.json`, JSON.stringify(data));
}

/** Deletes guilds that the bot was not in for over a year. */
async function cleanupGuildsDB(this: Client, guildId: Snowflake, db?: Database['guildSettings'][Snowflake]) {
  if (!db) return this.db.delete('guildSettings', guildId);

  if (this.guilds.cache.has(guildId)) return this.db.delete('guildSettings', `${guildId}.leftAt`);
  if (!db.leftAt || db.leftAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'years' }).years >= 1) return;

  log.debug(`Deleted guild ${guildId} from the database.`);
  return this.db.delete('guildSettings', guildId);
}

/** Deletes giveaway records that concluded over a month ago. */
function cleanupGiveawaysDB(
  this: Client, guildId: Snowflake,
  db?: NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['giveaway']>['giveaways']
) {
  if (!db) return;

  for (const [id, { ended, endAt }] of Object.entries(db)) {
    if (!ended || endAt >= getOneMonthAgo()) continue;
    void this.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${id}`);
  }
}

/** Removes all lastMentions data older than one month. */
function cleanupMentionsDB(this: Client, guildId: Snowflake, db?: NonNullable<Database['guildSettings'][Snowflake]>['lastMentions']) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (v.createdAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'months' }).months >= 1) continue;
    void this.db.delete('guildSettings', `${guildId}.lastMentions.${userId}`);
  }
}

/** Removes all AFK-Messages older than one month. */
function cleanupAfkMessagesDB(this: Client, guildId: Snowflake, db?: NonNullable<Database['guildSettings'][Snowflake]>['afkMessages']) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (v.createdAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'months' }).months >= 1) continue;
    void this.db.delete('guildSettings', `${guildId}.afkMessages.${userId}`);
  }
}

/** Removes all AFK-Messages older than one month. */
function cleanUpMinigamesDB(this: Client, guildId: Snowflake, db?: NonNullable<Database['guildSettings'][Snowflake]>['minigames']) {
  if (!db) return;

  for (const [gameId, data] of Object.entries(db)) {
    for (const messageId of Object.keys(data)) {
      if (SnowflakeUtil.timestampFrom(messageId) >= getOneMonthAgo()) continue;
      void this.db.delete('guildSettings', `${guildId}.${gameId}.${messageId}`);
    }
  }
}

export default {
  time: '00 00 00 01 * *',
  startNow: false,

  async onTick(): Promise<unknown> {
    const now = Temporal.Now.plainDateISO();

    if (this.settings.timeEvents.lastDBCleanup?.equals(now)) return void log('Already ran DB cleanup today');

    log('Started DB backup');
    await backupDBs.call(this);
    log('Backed up DBs');

    log('Started DB cleanup');

    for (const [guildId, guildSettings] of Object.entries(this.db.get('guildSettings'))) {
      void cleanupGuildsDB.call(this, guildId, guildSettings);
      cleanupGiveawaysDB.call(this, guildId, guildSettings.giveaway?.giveaways);
      cleanupMentionsDB.call(this, guildId, guildSettings.lastMentions);
      cleanupAfkMessagesDB.call(this, guildId, guildSettings.afkMessages);
      cleanUpMinigamesDB.call(this, guildId, guildSettings.minigames);
    }

    log('Cleaned guilds, giveaways, lastMentions, afkMessages & minigames DB');

    await this.db.update('botSettings', 'timeEvents.lastDBCleanup', now);
    log('Finished DB cleanup');
  }
} satisfies CronJob;