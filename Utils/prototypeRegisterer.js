const
  { CommandInteraction, Message, BaseClient, Collection, Status, AutocompleteInteraction, User, Guild, GuildMember } = require('discord.js'),
  { randomInt } = require('crypto'),
  { appendFileSync, readdirSync } = require('fs'),
  customReply = require('./customReply.js'),
  findAllEntries = require('./findAllEntries.js'),
  date = new Date().toLocaleDateString('en').replaceAll('/', '-'),
  getTime = () => new Date().toLocaleTimeString('en', { timeStyle: 'medium', hour12: false }),
  writeLogFile = (type, ...data) => appendFileSync(`./Logs/${date}_${type}.log`, `[${getTime()}] ${data.join(' ')}\n`);

console.warn('Overwriting the following variables and functions (if they exist):\n  Vanilla:    global.getDirectoriesSync, global.sleep, Array#random, Number#limit, Object#fMerge, Object#filterEmpty, Function#bBind\n  Discord.js: CommandInteraction#customReply, Message#customReply, BaseClient#prefixCommands, BaseClient#slashCommands, BaseClient#cooldowns, BaseClient#awaitReady, BaseClient#log, BaseClient#error, BaseClient#settings, AutocompleteInteraction#focused, Message#user, User#db, Guild#db, Guild#defaultSettings, GuildMember#db.');

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
Function.prototype.bBind = function bBind(thisArg, ...args) {
  const bound = this.bind(thisArg, ...args);
  bound.__targetFunction__ = this;
  bound.__boundThis__ = thisArg;
  bound.__boundArgs__ = args;
  return bound;
};
CommandInteraction.prototype.customReply = customReply;
Message.prototype.customReply = customReply;
BaseClient.prototype.prefixCommands = new Collection();
BaseClient.prototype.slashCommands = new Collection();
BaseClient.prototype.cooldowns = new Collection();
BaseClient.prototype.awaitReady = async function awaitReady() {
  while (this.ws.status != Status.Ready) await sleep(10);
  return this.application.name ? this.application : this.application.fetch();
};
BaseClient.prototype.log = function log(...data) {
  console.info(`[${getTime()}] ${data.join(' ')}`);
  writeLogFile('log', ...data);
  return this;
};
BaseClient.prototype.error = function log(...data) {
  console.error('\x1b[1;31m%s\x1b[0m', `[${getTime()}] ${data.join(' ')}`);
  writeLogFile('log', ...data);
  writeLogFile('error', ...data);
  return this;
};
Object.defineProperty(BaseClient.prototype, 'settings', {
  get() { return this.db?.get('botSettings') ?? {}; },
  set(val) { this.db.set('botSettings', val); },
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', { get() { return this.options.getFocused(true); } });
Object.defineProperty(Message.prototype, 'user', { get() { return this.author; } });
Object.defineProperty(User.prototype, 'db', {
  get() { return this.client.db?.get('userSettings')?.[this.id] ?? {}; },
  set(val) { this.client.db.set('userSettings', { [this.id]: val }); }
});
Object.defineProperty(Guild.prototype, 'db', {
  get() { return this.client.db?.get('guildSettings')?.[this.id] ?? {}; },
  set(val) { this.client.db.set('guildSettings', { [this.id]: val }); }
});
Object.defineProperty(Guild.prototype, 'defaultSettings', {
  get() { return this.client.db?.get('guildSettings')?.default ?? {}; },
  set(val) { this.client.db.set('guildSettings', { default: val }); }
});
Object.defineProperty(Guild.prototype, 'localeCode', {
  get() { return this.db.config?.lang || this.preferredLocale.slice(0, 2) || this.defaultSettings.config.lang; },
  set(val) { this.client.db.update('guildSettings', 'config.lang', val); }
});
Object.defineProperty(GuildMember.prototype, 'db', {
  get() { return findAllEntries.call(this.guild.db, this.id); },
  set() { throw new Error('You cannot set a value to GuildMember#db!'); }
});