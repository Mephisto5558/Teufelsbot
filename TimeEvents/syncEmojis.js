const
  { readdir, readFile } = require('node:fs/promises'),
  { parseEnv } = require('node:util'),
  { Client } = require('discord.js');

/**
 * @param {Record<string, Client>} sessions
 * @param {string} env
 * @param {string} token
 * @returns {Promise<Client<true>>} */
async function getClient(sessions, env, token) {
  const client = sessions[env] ?? new Client({ intents: [] });
  if (!sessions[env]) {
    sessions[env] = client;

    await client.login(token);
    await client.application.fetch();
    await client.application.emojis.fetch();

    log.debug(`Logged into "${client.application.name}" (${env})`);
  }

  return client;
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: false, // Getting ran even before logging into the client

  /** @this {Client | void} */
  async onTick() {
    const now = new Date();

    if (this?.settings.timeEvents.lastEmojiSync?.toDateString() == now.toDateString()) return void log('Already ran emoji sync today');

    /** @type {Record<string, Client>} */
    const sessions = {};

    if (this instanceof Client && this.isReady() && !sessions[this.botType]) {
      sessions[this.botType] = this;

      if (!this.application.name) await this.application.fetch();
      if (!this.application.emojis.cache.size) await this.application.emojis.fetch();
    }

    log('Started emoji sync').debug('Started emoji sync');

    /** @type {[string, string][]} */
    const clients = await Promise.all((await readdir('.', { withFileTypes: true })).reduce(async (acc, e) => {
      if (!e.isFile() || !e.name.startsWith('.env')) return acc;

      const { token, environment = 'main' } = parseEnv(await readFile(e.parentPath, { encoding: 'utf8' }));
      if (token && !acc.some(e => e.token == token)) acc.push([environment, token]);
    }, []));

    for (const [env1, token1] of clients) {
      const client1 = await getClient(sessions, env1, token1);

      for (const [env2, token2] of clients) {
        if (token1 == token2) continue;

        const client2 = await getClient(sessions, env2, token2);

        for (const [, emoji] of client2.application.emojis.cache) {
          if (client1.application.emojis.cache.some(e => e.name == emoji.name)) continue;

          await client1.application.emojis.create({ name: emoji.name, attachment: emoji.imageURL({ extension: emoji.animated ? 'gif' : undefined }) });
          log.debug(`Created emoji "${emoji.name}" on client "${client1.application.name}" from "${client2.application.name}"`);
        }
      }
    }

    // Log out of the clients
    for (const session of Object.values(sessions)) if (this != session) void session.destroy();

    await this?.db.update('botSettings', 'timeEvents.lastEmojiSync', now);

    log('Finished emoji sync').debug('Finished emoji sync');
  }
};