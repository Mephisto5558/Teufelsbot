const
  { Client } = require('discord.js'),
  { readdir, readFile } = require('node:fs/promises'),
  { join } = require('node:path'),
  { parseEnv } = require('node:util'),
  { DiscordAPIErrorCodes } = require('#Utils');

/**
 * @param {string} env
 * @param {string} token */
async function getClient(env, token) {
  if (!token) return;

  const client = new Client({ intents: [] });
  try { await client.login(token); }
  catch (err) {
    if (err.code == DiscordAPIErrorCodes.InvalidToken) return void log.error(`Invalid token ${token} for env "${env}"`);
    throw err;
  }
  await client.application.fetch();
  await client.application.emojis.fetch();

  log.debug(`Logged into "${client.application.name}" (${env})`);
  return client;
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: false, // Getting ran even before logging into the client

  /** @this {Client | void} */
  async onTick() {
    const now = new Date();

    if (this?.settings.timeEvents.lastEmojiSync?.toDateString() == now.toDateString()) return void log('Already ran emoji sync today');

    if (this instanceof Client && this.isReady()) {
      if (!this.application.name) await this.application.fetch();
      if (!this.application.emojis.cache.size) await this.application.emojis.fetch();
    }

    log('Started emoji sync').debug('Started emoji sync');

    const clients = await (await readdir('.', { withFileTypes: true })).reduce(async (acc, e) => {
      if (!e.isFile() || !e.name.startsWith('.env')) return acc;

      const { token, environment = 'main' } = parseEnv(await readFile(join(e.parentPath, e.name), 'utf8'));
      if (!token || (await acc).some(e => e.token == token)) return acc;

      const client = await getClient(environment, token);
      if (client) (await acc).push(client);

      return acc;
    }, Promise.resolve(this?.isReady() ? [this] : []));

    if (clients.length < 2) log('Not enough clients to sync.');
    else {
      for (const [name, emoji] of new Map(clients.flatMap(e => e.application.emojis.cache.map(e => [e.name, e])))) {
        for (const client of clients) {
          if (client.application.emojis.cache.some(e => e.name == name)) continue;

          try {
            await client.application.emojis.create({
              name, attachment: emoji.imageURL({ extension: emoji.animated ? 'gif' : undefined })
            });

            log.debug(`Created emoji "${name}" on client "${client.application.name}"`);
          }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.MaximumNumberOfEmojisReached) throw err;
            log.error(`Failed to create emoji ${emoji.name} (${emoji.id}) on ${client.botType} client "${client.application.name}":`, err.message);
          }
        }
      }
    }

    // Log out of the clients except the original one
    for (const client of clients) if (client != this) void client.destroy();

    await this?.db.update('botSettings', 'timeEvents.lastEmojiSync', now);

    log('Finished emoji sync').debug('Finished emoji sync');
  }
};