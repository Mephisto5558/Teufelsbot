const
  { writeFileSync } = require('node:fs'),
  configPath = require('node:path').resolve(process.cwd(), 'config.json'),
  validConfig = {
    devIds: 'object', // set<string>
    website: {
      domain: 'string',
      port: 'number',
      dashboard: 'string',
      privacyPolicy: 'string',
      invite: 'string',
      uptime: 'string',
      vote: 'string',
      todo: 'string'
    },
    github: {
      repo: 'string',
      userName: 'string',
      repoName: 'string'
    },
    ownerOnlyFolders: ['string'],
    discordInvite: 'string',
    mailAddress: 'string',
    hideOverwriteWarning: 'boolean',
    hideNonBetaCommandLog: 'boolean',
    hideDisabledCommandLog: 'boolean',
    replyOnDisabledCommand: 'boolean',
    replyOnNonBetaCommand: 'boolean',
    disableWebServer: 'boolean',
    enableConsoleFix: 'boolean'
  };

/** @type {import('.').configValidator.configValidationLoop} */
function configValidationLoop(obj = require(configPath), checkObj = validConfig, allowNull = true) {
  for (const [key, value] of Object.entries(obj)) {
    if (!(key in checkObj)) {
      log.warn(`Unknown key or subkey "${key}" in config.json.`);
      continue;
    }

    if (allowNull && value == undefined) continue;

    const expectedType = checkObj[key];
    if (typeof expectedType === 'string' && typeof value !== expectedType)
      throw new Error(`Invalid type for key or subkey ${key} in config.json: Expected ${expectedType}, got ${typeof value}`);
    else if (Array.isArray(expectedType) && !(Array.isArray(value) && value.every(v => typeof v === expectedType[0])))
      throw new Error(`Invalid type for key or subkey ${key} in config.json: Expected Array of ${expectedType[0]}, got ${typeof value}`);

    if (typeof value == 'object') return configValidationLoop(value, checkObj[key]);
  }
}

/** @type {import('.').configValidator.setDefaultConfig} */
function setDefaultConfig() {
  /** @type {Partial<Client['config']>} */
  let config;
  try { config = require(configPath); }
  catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') throw err;
    log.warn('Missing config.json. This file is required to run the bot.');

    writeFileSync(configPath, '{}');
    config = {};

    log.warn('An empty config.json has been created.');
  }

  config.devIds = new Set(config.devIds);
  config.website ??= {};
  config.github ??= {};
  config.replyOnDisabledCommand ??= true;
  config.replyOnNonBetaCommand ??= true;
  config.ownerOnlyFolders = config.ownerOnlyFolders?.map(e => e.toLowerCase()) ?? ['dev-only'];

  return config;
}

module.exports = { configValidationLoop, setDefaultConfig, validConfig };