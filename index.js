console.time('Starting time')
console.info('Starting...');

const
  { Client, Collection, GatewayIntentBits } = require('discord.js'),
  { reconDB } = require('reconlx'),
  { existsSync, readdirSync } = require('fs'),
  db = new reconDB(process.env.dbConnectionStr),
  isObject = item => item && typeof item == 'object' && !Array.isArray(item);

global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);
global.errorColor = '\x1b[1;31m%s\x1b[0m';

Array.prototype.equals = array => {
  if (!array || this.length != array.length) return false;

  for (let i = 0; i < this.length; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) if (!this[i].equals(array[i])) return false;
    else if (this[i] != array[i]) return false;
  }
  return true;
}
Array.prototype.random = function random() { return this[Math.round(Math.random() * (this.length - 1))] };
Object.defineProperty([
  Array.prototype, 'equals', { enumerable: false },
  Array.prototype, 'random', { enumerable: false }
]);

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

(async _ => {
  const client = new Client({
    allowedMentions: { parse: ['users', 'roles'] },
    shards: 'auto',
    retryLimit: 2,
    intents: [
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent
    ]
  });

  let env = existsSync('./env.json') ? require('./env.json') : await db.get('botSettings').env;
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
  client.log = (...data) => {
    const date = new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false });
    console.info(`[${date}] ${data}`)
  };

  await client.db.ready();

  for (const handler of readdirSync('./Handlers')) require(`./Handlers/${handler}`)(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}`);

  process
    .on('unhandledRejection', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtExceptionMonitor', err => require('./Functions/private/error_handler.js')(err))
    .on('uncaughtException', err => require('./Functions/private/error_handler.js')(err))
    .on('exit', _ => client.destroy());
})();