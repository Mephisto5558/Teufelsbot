const
  { ConnectionString } = require('mongodb-connection-string-url'),
  validConfig = {
    website: {
      baseDomain: 'string',
      domain: 'string',
      port: 'string',
      dashboard: 'string',
      privacyPolicy: 'string',
      invite: 'string'
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
    disableWebServer: 'boolean'
  },
  validEnv = {
    global: {
      environment: 'string',
      keys: {
        humorAPIKey: 'string',
        rapidAPIKey: 'string',
        githubKey: 'string',
        chatGPTApiKey: 'string',
        dbdLicense: 'string',
        votingWebhookURL: 'string'
      }
    },
    main: {
      dbConnectionStr: 'string',
      keys: {
        token: 'string',
        secret: 'string'
      }
    }
  };

/**
 * @param {Record<string, unknown>} obj
 * @param {Record<string, unknown>} checkObj
 * @param {boolean} allowNull
 * @throws {Error} If the config is invalid
 */
function configValidationLoop(obj, checkObj, allowNull) {
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

module.exports = function validateConfig() {
  const config = require('../config.json'); // prototypeRegisterer makes sure that the file exists
  if (config) configValidationLoop(config, validConfig, true);

  const env = require('../env.json');
  configValidationLoop(env, validEnv);
  if (!env[env.global.environment]) throw new Error('Error in env.json: Value in "environment" does not match any environment. Set "environment" to "main" if you don\'t know what you are doing.');

  try { void new ConnectionString(env[env.global.environment].dbConnectionStr); }
  catch (err) { throw new Error(`Error in env.json: Invalid mongoDB connection string: ${err}`); }
};