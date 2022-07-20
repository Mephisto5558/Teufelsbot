console.time('Starting time')
console.log('Starting...');

const
  { Client, Collection } = require('discord.js'),
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
  client.lastRateLimit = new Collection();
  client.events = new Collection();
  client.cooldowns = new Collection();
  client.commands = new Collection();
  client.guildData = new Collection();
  client.ready = async _ => {
    while (client.ws.status != 0) await client.functions.sleep(10);
    if (!client.application.name) await client.application.fetch();
    return true;
  };
  client.log = (...data) => {
    const date = new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false });
    console.log(`[${date}] ${data}`)
  };
  client.rateLimitCheck = async route => {
    if (!route) throw new SyntaxError('missing route arg');

    const rateLimit = client.lastRateLimit?.get(route);
    if (rateLimit?.remaining == 0) {
      client.log(`Waiting for ratelimit on route ${route} to subside`);
      await client.functions.sleep(rateLimit.resetAfter * 1000);
    }
  }

  client.on('apiResponse', (req, res) => {
    client.lastRateLimit.set(req.route, Object.assign({}, ...Array.from(res.headers)
      .filter(([a]) => /x-ratelimit/.test(a))
      .map(([a, b]) => { return { [a.replace('x-ratelimit-', '').replace(/-\w/, c => c[1].toUpperCase())]: b }; })
    ));
  });

  await client.db.ready();

  for (const handler of readdirSync('./Handlers')) require(`./Handlers/${handler}`)(client);

  client.login(client.keys.token)
    .then(_ => client.log(`Logged into ${client.botType}`));

  process.on('exit', _ => client.destroy());
}