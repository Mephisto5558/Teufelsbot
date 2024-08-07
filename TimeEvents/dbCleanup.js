const
  { SnowflakeUtil } = require('discord.js'),

  /** @returns {number}Unix timestamp*/
  getOneMonthAgo = () => new Date().setMonth(new Date().getMonth() - 1),

  /** @returns {number}Unix timestamp*/
  getOneYearAgo = () => new Date().setFullYear(new Date().getFullYear() - 1);

/**
 * Deletes guilds that the bot was not in for over a year
 * @this {Client}
 * @param {string}guildId
 * @param {Exclude<Database<true>['guildSettings'][''], undefined>}db*/
function cleanupGuildsDB(guildId, db) {
  if (!db) return this.db.delete('guildSettings', guildId);
  if (!db?.leftAt || db.leftAt.getTime() < getOneYearAgo()) return;

  log.debug(`Deleted guild ${guildId} from the database.`);
  return this.db.delete('guildSettings', guildId);
}

/**
 * Deletes giveaway records that concluded over a month ago
 * @this {Client}
 * @param {string}guildId
 * @param {Exclude<Database<true>['guildSettings']['']['giveaway'], undefined>['giveaways'] | undefined}db*/
function cleanupGiveawaysDB(guildId, db) {
  if (!db) return;

  for (const [id, { ended, endAt }] of Object.entries(db)) {
    if (!ended || getOneMonthAgo() < endAt) continue;
    this.db.delete('guildSettings', `${guildId}.giveaway.giveaways.${id}`);
  }
}

/**
 * Removes all lastMentions data older than one month
 * @this {Client}
 * @param {string}guildId
 * @param {Exclude<Database['guildSettings'][''], undefined>['lastMentions']}db*/
function cleanupMentionsDB(guildId, db) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (getOneMonthAgo() < v.createdAt.getTime()) continue;
    this.db.delete('guildSettings', `${guildId}.lastMentions.${userId}`);
  }
}

/**
 * Removes all AFK-Messages older than one month
 * @this {Client}
 * @param {string}guildId
 * @param {Exclude<Database['guildSettings'][''], undefined>['afkMessages']}db*/
function cleanupAfkMessagesDB(guildId, db) {
  if (!db) return;

  for (const [userId, v] of Object.entries(db)) {
    if (getOneMonthAgo() < v.createdAt.getTime()) continue;
    this.db.delete('guildSettings', `${guildId}.afkMessages.${userId}`);
  }
}

/**
 * Removes all AFK-Messages older than one month
 * @this {Client}
 * @param {string}guildId
 * @param {Exclude<Database['guildSettings'][''], undefined>['minigames']}db*/
function cleanUpMinigamesDB(guildId, db) {
  if (!db) return;

  for (const [gameId, data] of Object.entries(db)) {
    for (const messageId of Object.keys(data)) {
      if (getOneMonthAgo() < SnowflakeUtil.timestampFrom(messageId)) continue;
      this.db.delete('guildSettings', `${guildId}.${gameId}.${messageId}`);
    }
  }
}

module.exports = {
  time: '00 00 00 01 * *',
  startNow: false,

  /** @this {Client}*/
  onTick: async function () {
    const now = new Date();

    if (this.settings.lastDBCleanup.toDateString() == now.toDateString()) return void log('Already ran DB cleanup today');
    log('Started DB cleanup');

    for (const [guildId, guildSettings] of Object.entries(this.db.get('guildSettings'))) {
      if (guildId == 'default') continue;

      cleanupGuildsDB.call(this, guildId, guildSettings);
      cleanupGiveawaysDB.call(this, guildId, guildSettings.giveaway?.giveaways);
      cleanupMentionsDB.call(this, guildId, guildSettings.lastMentions);
      cleanupAfkMessagesDB.call(this, guildId, guildSettings.afkMessages);
      cleanUpMinigamesDB.call(this, guildId, guildSettings.minigames);
    }

    log('Cleaned guilds, giveaways, lastMentions, afkMessages & minigames DB');

    await this.db.update('botSettings', 'lastDBCleanup', now);
    log('Finished DB cleanup');
  }
};