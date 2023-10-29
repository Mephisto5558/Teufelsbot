console.time('Initializing time');
console.info('Starting...');

Error.stackTraceLimit = Infinity;

const
  { Client, GatewayIntentBits, AllowedMentionsTypes, Partials } = require('discord.js'),
  { readdir } = require('fs/promises'),
  DB = require('@mephisto5558/mongoose-db'),
  { gitpull, errorHandler, giveawaysmanager } = require('./Utils');

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
  }).on('error', err => errorHandler.call(client, err));

  let env;
  try { env = require('./env.json'); }
  catch {
    client.db = await new DB(process.env.dbConnectionStr, 100).fetchAll();
    env = client.settings.env;
  }

  env = env.global.fMerge(env[env.global.environment]);

  client.db ??= await new DB(env.dbConnectionStr, 100).fetchAll();

  client.botType = env.environment;
  client.keys = env.keys;
  //WIP: client.backupSystem = new BackupSystem(client.db, { dbName: 'backups', maxGuildBackups: 5 });

  if (client.botType != 'dev') client.giveawaysManager = giveawaysmanager.call(client);

  for (const handler of await readdir('./Handlers')) if (client.botType != 'dev' || !handler.includes('website')) require(`./Handlers/${handler}`).call(client);

  await client.login(client.keys.token);
  log(`Logged into ${client.botType}`);

  client.db.update('botSettings', `startCount.${client.botType}`, client.settings.startCount[client.botType] + 1 || 1);

  process
    .on('unhandledRejection', err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => errorHandler.call(client, err))
    .on('uncaughtException', err => errorHandler.call(client, err));
})();