const
  { SnowflakeUtil } = require('discord.js'),
  { writeFile } = require('node:fs/promises');

/** @returns {number} Unix timestamp in ms */
const getOneMonthAgo = () => Temporal.Now.instant().subtract({ months: 1 }).epochMilliseconds;


/**
 * Writes the data to a file.
 * @this {Client} */
async function backupDBs() {
  const data = Object.fromEntries(this.db.reduce().map(e => [e.key, e.value]));

  return writeFile(`dbbackup_${Temporal.Now.plainDateISO().toString()}.json`, JSON.stringify(data));
}

/**
 * Deletes guilds that the bot was not in for over a year.
 * @this {Client}
 * @param {Snowflake} guildId
 * @param {Database['guildSettings'][Snowflake] | undefined} db */
async function cleanupGuildsDB(guildId, db) {
  if (!db) return this.db.delete('guildSettings', guildId);

  if (this.guilds.cache.has(guildId)) return this.db.delete('guildSettings', `${guildId}.leftAt`);
  if (!db.leftAt || db.leftAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'years' }).years >= 1) return;

  log.debug(`Deleted guild ${guildId} from the database.`);
  return this.db.delete('guildSettings', guildId);
}

/**
 * Deletes giveaway records that concluded over a month ago.
 * @this {Client}
 * @param {Snowflake} guildId
 * @param {NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['giveaway']>['giveaways'] | undefined} db */
function cleanupGiveawaysDB(guildId, db) {
  if (!db) return;

  for (const [id, { ended, endAt }] of Object.entries(db)) {
    if (!ended || endAt >= getOneMonthAgo()) continue;
    void this.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${id}`);
  }
}

/**
 * Removes all lastMentions data older than one month.
 * @this {Client}
 * @param {Snowflake} guildId
 * @param {NonNullable<Database['guildSettings'][Snowflake]>['lastMentions']} db */
function cleanupMentionsDB(guildId, db) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (v.createdAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'months' }).months >= 1) continue;
    void this.db.delete('guildSettings', `${guildId}.lastMentions.${userId}`);
  }
}

/**
 * Removes all AFK-Messages older than one month.
 * @this {Client}
 * @param {Snowflake} guildId
 * @param {NonNullable<Database['guildSettings'][Snowflake]>['afkMessages']} db */
function cleanupAfkMessagesDB(guildId, db) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (v.createdAt.toZonedDateTimeISO('UTC').until(Temporal.Now.zonedDateTimeISO('UTC'), { largestUnit: 'months' }).months >= 1) continue;
    void this.db.delete('guildSettings', `${guildId}.afkMessages.${userId}`);
  }
}

/**
 * Removes all AFK-Messages older than one month.
 * @this {Client}
 * @param {Snowflake} guildId
 * @param {NonNullable<Database['guildSettings'][Snowflake]>['minigames']} db */
function cleanUpMinigamesDB(guildId, db) {
  if (!db) return;

  for (const [gameId, data] of Object.entries(db)) {
    for (const messageId of Object.keys(data)) {
      if (SnowflakeUtil.timestampFrom(messageId) >= getOneMonthAgo()) continue;
      void this.db.delete('guildSettings', `${guildId}.${gameId}.${messageId}`);
    }
  }
}

module.exports = {
  time: '00 00 00 01 * *',
  startNow: false,

  /** @this {Client} */
  async onTick() {
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
};