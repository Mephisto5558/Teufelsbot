console.time('Initialising time');
console.info('Starting...');

const
  { Client, Collection, GatewayIntentBits, AllowedMentionsTypes } = require('discord.js'),
  { randomInt } = require('crypto'),
  { reconDB } = require('reconlx'),
  { existsSync, readdirSync } = require('fs'),
  isObject = item => item && typeof item == 'object' && !Array.isArray(item);

global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);

Array.prototype.equals = array => {
  if (!array || this.length != array.length) return false;

  for (let i = 0; i < this.length; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) if (!this[i].equals(array[i])) return false;
    else if (this[i] != array[i]) return false;
  }
  return true;
}
Array.prototype.random = function random() { return this[randomInt(this.length - 1)] };

Object.defineProperty(Array.prototype, 'equals', { enumerable: false });
Object.defineProperty(Array.prototype, 'random', { enumerable: false });

Object.merge = (source, source2, mode) => {
  let output = source;

  if (isObject(source) && isObject(source2)) for (const key of Object.keys({ ...source, ...source2 })) {
    if (isObject(source[key])) output[key] = key in source2 ? Object.merge(source[key], source2[key], mode) : source[key];
    else if (Array.isArray(source[key])) {
      if (key in source2) {
        if (mode == 'overwrite') output[key] = source2[key];
        else if (mode == 'push') for (const e of source2[key]) output[key].push(e);
        else for (let i = 0; i < source[key].length || i < source2[key].length; i++) output[key][i] = i in source2[key] ? source2[key][i] : source[key][i];
      }
      else output[key] = source[key];
    }
    else output = { ...output, [key]: key in source2 ? source2[key] : source[key] };
  }
  return output;
}

console.timeEnd('Initialising time');
console.time('Starting time');

(async _ => {
  const client = new Client({
    allowedMentions: {
      parse: [
        AllowedMentionsTypes.User,
        AllowedMentionsTypes.Role
      ]
    },
    shards: 'auto',
    retryLimit: 2,
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
    ]
  });
  const db = new reconDB(process.env.dbConnectionStr);
  await db.ready();

  await require('./Website/custom/git/pull.js').run();

  let env = existsSync('./env.json') ? require('./env.json') : (await db.get('botSettings')).env;
  env = Object.merge(env.global, env[env.global.environment]);

  client.userID = env.botUserID;
  client.botType = env.environment;
  client.startTime = Date.now();
  client.categories = getDirectoriesSync('./Commands');
  client.db = db;
  client.functions = {};
  client.dashboardOptionCount = {};
  client.keys = env.keys;
  client.events = new Collection();
  client.cooldowns = new Collection();
  client.commands = new Collection();
  client.guildData = new Collection();

  if(client.botType != 'dev') client.giveawaysManager = require('./Functions/private/giveawaysmanager.js')(client);

  await require('./Handlers/log_handler.js')(client);
  for (const handler of readdirSync('./Handlers').filter(e => e != 'log_handler.js')) require(`./Handlers/${handler}`)(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}`);

  process
    .on('unhandledRejection', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtExceptionMonitor', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtException', err => require('./Functions/private/error_handler.js')(err))
})();