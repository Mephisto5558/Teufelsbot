console.time('Starting time')
console.log('Starting...');

require('./Website/autopull.js');

const
  { Client, Collection, GatewayIntentBits, Partials } = require('discord.js'),
  { reconDB } = require('reconlx'),
  { existsSync, readdirSync } = require('fs'),
  db = new reconDB(process.env.dbConnectionStr),
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
Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

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
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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

  let defaultSettings;

  if (existsSync('./env.json')) defaultSettings = require('./env.json');
  else {
    await db.ready();
    defaultSettings = await db.get('env');
  }

  defaultSettings = Object.assign({}, defaultSettings.global,
    defaultSettings[defaultSettings.global.environment],
    { keys: Object.assign({}, defaultSettings.global.keys, defaultSettings[defaultSettings.global.environment].keys) }
  );

  client.userID = defaultSettings.botUserID;
  client.botType = defaultSettings.type;
  client.startTime = Date.now();
  client.categories = getDirectoriesSync('./Commands');
  client.db = db;
  client.functions = {};
  client.dashboardOptionCount = {};
  client.keys = defaultSettings.keys;
  client.events = new Collection();
  client.cooldowns = new Collection();
  client.commands = new Collection();
  client.guildData = new Collection();
  client.log = (...data) => {
    const date = new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false });
    console.log(`[${date}] ${data}`)
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