console.time('Initializing time');
console.info('Starting...');

const
  { Client, Collection, GatewayIntentBits, AllowedMentionsTypes, Message, CommandInteraction, Partials } = require('discord.js'),
  { randomInt } = require('crypto'),
  { existsSync, readdirSync } = require('fs'),
  DB = require('./Functions/private/db.js'),
  customReply = require('./Functions/private/reply.js'),
  isObject = item => ({}).toString() == item?.toString();

global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);

Array.prototype.random = function random() { return this[randomInt(this.length - 1)] };
Number.prototype.limit = function limit({ min = -Infinity, max = Infinity }) { return Math.min(Math.max(Number(this), min), max) };
Object.prototype.fMerge = function fMerge(obj, mode, { ...output } = { ...this }) {
  if (isObject(this) && isObject(obj)) for (const key of Object.keys({ ...this, ...obj })) {
    if (isObject(this[key])) output[key] = key in obj ? this[key].fMerge(obj[key], mode) : this[key];
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
CommandInteraction.prototype.customReply = customReply;
Message.prototype.customReply = customReply;

console.timeEnd('Initializing time');
console.time('Starting time');

(async function main() {
  const client = new Client({
    allowedMentions: {
      parse: [
        AllowedMentionsTypes.User,
        AllowedMentionsTypes.Role
      ]
    },
    shards: 'auto',
    rest: { retries: 2 },
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
    ],
    partials: [
      Partials.Message,
      Partials.Reaction
    ]
  });
  let env;

  await require('./Website/custom/git/pull.js').run();

  if (existsSync('./env.json')) env = require('./env.json');
  else {
    client.db = await new DB(process.env.dbConnectionStr).fetchAll();
    env = client.db.get('botSettings').env;
  }

  env = env.global.fMerge(env[env.global.environment]);

  if (!client.db) client.db = await new DB(env.dbConnectionStr).fetchAll();

  client.botType = env.environment;
  client.functions = {};
  client.dashboardOptionCount = {};
  client.keys = env.keys;
  client.cooldowns = new Collection();
  client.commands = new Collection();
  client.voiceManager = new Collection();

  if (client.botType != 'dev') client.giveawaysManager = require('./Functions/private/giveawaysmanager.js')(client);

  for (const handler of readdirSync('./Handlers').sort(a => a == 'log_handler.js' ? -1 : 1)) require(`./Handlers/${handler}`)(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}`);

  process
    .on('unhandledRejection', err => require('./Functions/private/error_handler.js')(err, client))
    .on('uncaughtExceptionMonitor', err => require('./Functions/private/error_handler.js')(err, client))
    .on('uncaughtException', err => require('./Functions/private/error_handler.js')(err, client));
})();