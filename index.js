console.time('Initializing time');
console.info('Starting...');

const
  { Client, GatewayIntentBits, AllowedMentionsTypes, Partials } = require('discord.js'),
  { existsSync, readdirSync } = require('fs'),
  { DB, gitpull, errorHandler, giveawaysmanager } = require('./Utils');

require('./Utils/prototypeRegisterer.js');

console.timeEnd('Initializing time');
console.time('Starting time');

(async function main() {
  await gitpull();

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

  if (existsSync('./env.json')) env = require('./env.json');
  else {
    client.db = await new DB(process.env.dbConnectionStr).fetchAll();
    env = client.settings.env;
  }

  env = env.global.fMerge(env[env.global.environment]);

  client.db ??= await new DB(env.dbConnectionStr).fetchAll();

  client.botType = env.environment;
  client.keys = env.keys;
  //WIP: client.backupSystem = new BackupSystem(client.db, { dbName: 'backups', maxGuildBackups: 5 });

  if (client.botType != 'dev') client.giveawaysManager = giveawaysmanager.call(client);

  for (const handler of readdirSync('./Handlers').filter(e => client.botType != 'dev' || !e.includes('website')))
    require(`./Handlers/${handler}`).call(client);

  await client.login(client.keys.token);
  client
    .log(`Logged into ${client.botType}`)
    .db.update('botSettings', `startCount.${client.botType}`, this.client.settings.startCount[this.client.botType] + 1 || 1);

  process
    .on('unhandledRejection', err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => errorHandler.call(client, err))
    .on('uncaughtException', err => errorHandler.call(client, err));
})();