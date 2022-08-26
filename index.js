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
Number.prototype.limit = function limit({ min = -Infinity, max = Infinity }) { return Math.min(Math.max(parseInt(this), min), max) };
Object.prototype.merge = function merge(obj, mode, { ...output } = { ...this }) {
  if (isObject(this) && isObject(obj)) for (const key of Object.keys({ ...this, ...obj })) {
    if (isObject(this[key])) output[key] = key in obj ? this[key].merge(obj[key], mode) : this[key];
    else if (Array.isArray(this[key])) {
      if (key in obj) {
        if (mode == 'overwrite') output[key] = obj[key];
        else if (mode == 'push') for (const e of obj[key]) output[key].push(e);
        else for (let i = 0; i < this[key].length || i < obj[key].length; i++) output[key][i] = i in obj[key] ? obj[key][i] : this[key][i];
      }
      else output[key] = this[key];
    }
    else output = { ...output, [key]: key in obj ? obj[key] : this[key] };
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
  let env, db;

  await require('./Website/custom/git/pull.js').run();

  if (existsSync('./env.json')) env = require('./env.json');
  else {
    db = new reconDB(process.env.dbConnectionStr);
    env = (await db.get('botSettings')).env;
  }

  env = env.global.merge(env[env.global.environment]);

  if (!db) db = new reconDB(env.dbConnectionStr);
  await db.ready();

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

  if (client.botType != 'dev') client.giveawaysManager = require('./Functions/private/giveawaysmanager.js')(client);

  await require('./Handlers/log_handler.js')(client);
  for (const handler of readdirSync('./Handlers').filter(e => e != 'log_handler.js')) require(`./Handlers/${handler}`)(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}`);

  process
    .on('unhandledRejection', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtExceptionMonitor', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtException', err => require('./Functions/private/error_handler.js')(err))
})();