console.time('Initializing time');
console.info('Starting...');

Error.stackTraceLimit = 100;

const
  { Client, GatewayIntentBits, AllowedMentionsTypes, Partials } = require('discord.js'),
  { readdir } = require('fs/promises'),
  { DB } = require('@mephisto5558/mongoose-db'),
  { GiveawaysManager, gitpull, errorHandler, getCommands } = require('./Utils'),
  { WebServer } = require('@mephisto5558/bot-website'),
  { discordInvite, mailAddress } = require('./config.json');

require('./Utils/prototypeRegisterer.js');

console.timeEnd('Initializing time');
console.time('Starting time');

(async function main() {
  if ((await gitpull()).message?.includes('Could not resolve host')) {
    log.error('It seems like the bot does not have internet access.');
    process.exit(1);
  }

  const client = new Client({
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

  let env;
  try { env = require('./env.json'); }
  catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') throw err;

    client.db = await new DB(process.env.dbConnectionStr, 'db-collection', 100).fetchAll();
    env = client.settings.env;
  }

  env = env.global.fMerge(env[env.global.environment]);

  client.db ??= await new DB(env.dbConnectionStr, 'db-collection', 100).fetchAll();

  client.botType = env.environment;
  client.keys = env.keys;
  //WIP: client.backupSystem = new BackupSystem(client.db, { dbName: 'backups', maxGuildBackups: 5 });

  if (client.botType != 'dev') client.giveawaysManager = new GiveawaysManager(client);

  for (const handler of await readdir('./Handlers')) require(`./Handlers/${handler}`).call(client);

  await client.login(client.keys.token);
  log(`Logged into ${client.botType}`);

  client.webServer = await (new WebServer(
    client, client.db,
    { secret: client.keys.secret, dbdLicense: client.keys.dbdLicense, webhookURL: client.keys.votingWebhookURL },
    {
      support: { discord: discordInvite, mail: mailAddress }, errorPagesDir: './Website/CustomSites/error',
      settingsPath: './Website/DashboardSettings', customPagesPath: './Website/CustomSites'
    }, errorHandler.bind(client)
  )).init(await getCommands(client.i18n.__.bBind(client.i18n, { locale: 'en', undefinedNotFound: true })));

  client.db.update('botSettings', `startCount.${client.botType}`, client.settings.startCount[client.botType] + 1 || 1);

  process
    .on('unhandledRejection', err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => errorHandler.call(client, err))
    .on('uncaughtException', err => errorHandler.call(client, err));
})();