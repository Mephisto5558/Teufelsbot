console.time('Starting time')
console.log('Starting...');

const
  { Client, Collection } = require('discord.js'),
  { reconDB } = require('reconlx'),
  { existsSync, readdirSync} = require('fs'),
  db = new reconDB(process.env.dbConnectionStr);

  global.RegExp.timeoutMatch = require('time-limited-regular-expressions')().match;
  global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);

load()
async function load() {
  const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    allowedMentions: { parse: ['users', 'roles'] },
    shards: 'auto',
    retryLimit: 2,
    intents: 32767
  });
  
  if (existsSync('./env.json')) defaultSettings = require('./env.json');
  else {
    await db.ready();
    defaultSettings = await db.get('env');
  }

  defaultSettings = await Object.assign(
    {}, defaultSettings.global,
    defaultSettings[defaultSettings.global.environment],
    { keys: Object.assign({}, defaultSettings.global.keys, defaultSettings[defaultSettings.global.environment].keys) }
  );
  
  client.owner = defaultSettings.botOwnerID;
  client.userID = defaultSettings.botUserID;
  client.botType = defaultSettings.type;
  client.startTime = Date.now();
  client.categories = getDirectoriesSync('./Commands');
  client.db = db;
  client.functions = {};
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

  for(const handler of readdirSync('./Handlers')) require(`./Handlers/${handler}`)(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}\n`);

  process.on('exit', _ => client.destroy());
}