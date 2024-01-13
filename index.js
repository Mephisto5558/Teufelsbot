console.time('Initializing time');
console.info('Starting...');

Error.stackTraceLimit = 100;

const
  { Client, GatewayIntentBits, AllowedMentionsTypes, Partials } = require('discord.js'),
  { readdir } = require('fs/promises'),
  { DB } = require('@mephisto5558/mongoose-db'),
  { WebServer } = require('@mephisto5558/bot-website'),
  { GiveawaysManager, gitpull, errorHandler, getCommands } = require('./Utils'),
  { discordInvite, mailAddress } = require('./config.json');

function createClient() {
  return new Client({
    shards: 'auto',
    failIfNotExists: false,
    allowedMentions: {
      parse: [
        AllowedMentionsTypes.User,
        AllowedMentionsTypes.Role
      ]
    },
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.Reaction
    ]
  });
}

/**
 * Loads env and initializes client.db
 * @param {Client}client @returns {Promise<object>}
 */
async function loadEnv(client) {
  let env;
  try { env = require('./env.json'); }
  catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') throw err;

    client.db = await new DB().init(process.env.dbConnectionStr, 'db-collection', 100);
    env = client.db.get('botSettings', 'env');
  }

  env = env.global.fMerge(env[env.global.environment]);
  client.db ??= await new DB().init(env.dbConnectionStr, 'db-collection', 100);

  return env;
}

/**@param {Client}client*/
async function processMessageEventCallback(client, message) {
  if (message != 'Start WebServer') return;

  client.webServer ??= await (new WebServer(
    client, client.db,
    { secret: client.keys.secret, dbdLicense: client.keys.dbdLicense, webhookURL: client.keys.votingWebhookURL },
    {
      support: { discord: discordInvite, mail: mailAddress }, errorPagesDir: './Website/CustomSites/error',
      settingsPath: './Website/DashboardSettings', customPagesPath: './Website/CustomSites'
    }, errorHandler.bind(client)
  )).init(await getCommands(client.i18n.__.bBind(client.i18n, { locale: 'en', undefinedNotFound: true })));

  process.removeListener('message', processMessageEventCallback.bind(client));
}

require('./Utils/prototypeRegisterer.js');

console.timeEnd('Initializing time');
console.time('Starting time');

(async function main() {
  if ((await gitpull()).message?.includes('Could not resolve host')) {
    log.error('It seems like the bot does not have internet access.');
    process.exit(1);
  }

  const
    client = createClient(),
    env = await loadEnv(client);

  client.botType = env.environment;
  client.keys = env.keys;
  //WIP: client.backupSystem = new BackupSystem(client.db, { dbName: 'backups', maxGuildBackups: 5 });

  if (client.botType != 'dev') client.giveawaysManager = new GiveawaysManager(client);

  /**@type {Promise[]}*/
  const handlerPromises = (await readdir('./Handlers')).map(handler => require(`./Handlers/${handler}`).call(client));

  await client.login(client.keys.token);
  log(`Logged into ${client.botType}`);

  if (process.connected) process.on('message', processMessageEventCallback.bind(client));
  else processMessageEventCallback(client, 'Start WebServer'); // If the process is an orphan

  await Promise.allSettled(handlerPromises);

  if (process.send?.('Finished starting') === false) {
    log.error('Could not tell the parent to kill itself. Exiting to prevent duplicate code execution.');
    process.exit(1);
  } // Webserver will created after the parent exited.

  while (!client.webServer) await sleep(100);

  client.db.update('botSettings', `startCount.${client.botType}`, client.settings.startCount[client.botType] + 1 || 1);

  log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.\n`);
  console.timeEnd('Starting time');

  process
    .on('unhandledRejection', err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => errorHandler.call(client, err))
    .on('uncaughtException', err => errorHandler.call(client, err));
})();