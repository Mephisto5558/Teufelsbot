const
  { setDefaultConfig, configValidationLoop, validConfig } = require('#Utils').configValidator,
  /* eslint-disable-next-line @typescript-eslint/unbound-method -- not an issue with `node:path` */
  { resolve } = require('node:path'),
  filePath = resolve(process.cwd(), 'config.json');

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    log.debug(`Reloading config, initiated by user ${this.user.tag}`);

    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- require.cache */
    delete require.cache[filePath];

    const config = setDefaultConfig();
    try { configValidationLoop(config, validConfig, true); }
    catch (err) { return this.customReply(lang('error', err.message)); }

    config.devIds.add(this.client.user.id).add(this.client.application.owner.owner?.id ?? this.client.application.owner.id);
    this.client.config = config;
    return this.customReply(lang('success'));
  }
};