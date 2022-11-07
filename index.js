console.time('Initializing time');
console.info('Starting...');

const
  { Client, Status, Collection, GatewayIntentBits, AllowedMentionsTypes, Message, CommandInteraction, Partials, AutocompleteInteraction, BaseClient } = require('discord.js'),
  { randomInt } = require('crypto'),
  { existsSync, readdirSync } = require('fs'),
  DB = require('./Utils/db.js'),
  customReply = require('./Utils/customReply.js');

global.getDirectoriesSync = path => readdirSync(path, { withFileTypes: true }).filter(e => e.isDirectory()).map(directory => directory.name);
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

Array.prototype.random = function random() { return this[randomInt(this.length)]; };
Number.prototype.limit = function limit({ min = -Infinity, max = Infinity } = {}) { return Math.min(Math.max(Number(this), min), max); };
Object.prototype.fMerge = function fMerge(obj, mode, { ...output } = { ...this }) {
  if (`${{}}` != this || `${{}}` != obj) return output;
  for (const key of Object.keys({ ...this, ...obj })) {
    if (`${{}}` == this[key]) output[key] = key in obj ? this[key].fMerge(obj[key], mode) : this[key];
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
};
Object.prototype.filterEmpty = function filterEmpty() { return Object.fromEntries(Object.entries(this).flatMap(([k, v]) => ((val = Object(v) !== v ? v : v.filterEmpty()) => !(val == null || (Object(val) === val && Object.keys(val).length == 0)) ? [[k, val]] : [])())); };
CommandInteraction.prototype.customReply = customReply;
Message.prototype.customReply = customReply;
BaseClient.prototype.awaitReady = async function awaitReady() {
  while (this.ws.status != Status.Ready) await sleep(10);
  return this.application.name ? this.application : this.application.fetch();
};
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', { get() { return this.options.getFocused(true); } });

console.timeEnd('Initializing time');
console.time('Starting time');

(async function main() {
  await require('./Utils/gitpull.js')();

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
  const error = err => require('./Utils/error_handler.js').call(client, err);
  client.on('error', error);
  let env;

  if (existsSync('./env.json')) env = require('./env.json');
  else {
    client.db = await new DB(process.env.dbConnectionStr).fetchAll();
    env = client.db.get('botSettings').env;
  }

  env = env.global.fMerge(env[env.global.environment]);

  if (!client.db) client.db = await new DB(env.dbConnectionStr).fetchAll();

  client.botType = env.environment;
  client.keys = env.keys;
  client.prefixCommands = new Collection();
  client.cooldowns = new Collection();

  if (client.botType != 'dev') client.giveawaysManager = require('./Utils/giveawaysmanager.js')(client);

  for (const handler of readdirSync('./Handlers').filter(e => client.botType != 'dev' || !e.includes('website')))
    require(`./Handlers/${handler}`).call(client);

  await client.login(client.keys.token);
  client.log(`Logged into ${client.botType}`);

  process
    .on('unhandledRejection', error)
    .on('uncaughtExceptionMonitor', error)
    .on('uncaughtException', error);
})();