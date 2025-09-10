const
  { Team } = require('discord.js'),
  { resolve } = require('node:path'),
  { setDefaultConfig, configValidationLoop, validConfig } = require('#Utils').configValidator,

  filePath = resolve(process.cwd(), 'config.json');

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  async run(lang) {
    log.debug(`Reloading config, initiated by user ${this.user.tag}`);

    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- require.cache */
    delete require.cache[filePath];

    const config = setDefaultConfig();
    try { configValidationLoop(config, validConfig, true); }
    catch (err) { return this.customReply(lang('error', err.message)); }

    config.devIds.add(this.client.application.owner instanceof Team ? this.client.application.owner.ownerId : this.client.application.owner.id);
    this.client.config = config;
    return this.customReply(lang('success'));
  }
};