const
  { BaseInteraction, Message, Collection, AutocompleteInteraction, User, Guild, GuildMember, ButtonBuilder, Events, Client } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  GameBoardButtonBuilder = require('discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder').default,
  { randomInt } = require('node:crypto'),
  { join } = require('node:path'),
  { DB } = require('@mephisto5558/mongoose-db'),
  I18nProvider = require('@mephisto5558/i18n'),
  { Log, customReply, runMessages, _patch, playAgain } = require('./prototypeRegisterer/'),
  findAllEntries = require('./findAllEntries.js'),

  /** @type {Client['config']} */
  config = require('../config.json'),
  parentUptime = Number(process.argv.find(e => e.startsWith('uptime'))?.split('=')[1]) || 0;

/**
 * @param {Record<string, any>}target
 * @param {Record<string, any>}source
 * @returns {object} recursively merged Object*/
function deepMerge(target, source) {
  for (const key in source)
    if (Object.hasOwn(source, key)) target[key] = source[key] instanceof Object ? deepMerge(target[key] ?? {}, source[key]) : source[key];

  return target;
}

config.website ??= {};
config.github ??= {};
config.replyOnDisabledCommand ??= true;
config.replyOnNonBetaCommand ??= true;
config.ownerOnlyFolders = config.ownerOnlyFolders?.map(e => e?.toLowerCase()) ?? ['owner-only'];

if (!config.hideOverwriteWarning) {
  console.warn(
    'Overwriting the following variables and functions (if they exist):'
    + `Vanilla:    ${parentUptime ? 'process#childUptime, process#uptime (adding parent process uptime),' : ''} global.sleep, global.log, Array#random, Number#limit, `
    + 'Object#filterEmpty, Function#bBind'
    + 'Discord.js: BaseInteraction#customReply, Message#user, Message#customReply, Message#runMessages, Client#prefixCommands, Client#slashCommands, Client#cooldowns, '
    + 'Client#loadEnvAndDB, Client#awaitReady, Client#defaultSettings, Client#settings, AutocompleteInteraction#focused, User#db, Guild#db, Guild#localeCode, GuildMember#db.\n'
    + 'Modifying Discord.js Message._patch method.`'
  );
}

if (parentUptime) {
  process.childUptime = process.uptime;
  process.uptime = function uptime() {
    return this.childUptime() + parentUptime;
  };
}

global.log = new Log();
global.sleep = require('node:util').promisify(setTimeout);

Object.defineProperty(Array.prototype, 'random', {
  /** @type {global['Array']['prototype']['random']}*/
  value: function random() { return this[randomInt(this.length)]; },
  enumerable: false
});
Object.defineProperty(Number.prototype, 'limit', {
  /** @type {global['Number']['prototype']['limit']}*/
  value: function limit({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) { return Math.min(Math.max(Number(this), min), max); },
  enumerable: false
});
Object.defineProperty(Object.prototype, 'filterEmpty', {
  /** @type {global['Object']['prototype']['filterEmpty']}*/
  value: function filterEmpty() {
    return Object.entries(this).reduce((acc, [k, v]) => {
      if (!(v === null || (typeof v == 'object' && !Object.keys(v).length)))
        acc[k] = v instanceof Object ? v.filterEmpty() : v;
      return acc;
    }, {});
  },
  enumerable: false
});
Object.defineProperty(Function.prototype, 'bBind', {
  /** @type {global['Function']['prototype']['bBind']}*/
  value: function bBind(thisArg, ...args) {
    const bound = this.bind(thisArg, ...args);
    bound.__targetFunction__ = this;
    bound.__boundThis__ = thisArg;
    bound.__boundArgs__ = args;
    return bound;
  },
  enumerable: false
});
Object.defineProperty(BaseInteraction.prototype, 'customReply', {
  value: customReply,
  enumerable: false
});
Object.defineProperties(Client.prototype, {
  prefixCommands: { value: new Collection() },
  slashCommands: { value: new Collection() },
  i18n: {
    value: new I18nProvider({
      notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: join(__dirname, '/../Locales'),
      warnLoggingFunction: log._log.bind(log, { file: 'warn', type: 'I18n' })
    })
  },
  cooldowns: { value: new Map() },
  config: { value: config },

  /** @type {Record<string, (this: Client, val: any) => any>} */
  settings: {
    get() { return this.db.get('botSettings'); },
    set(val) { this.db.set('botSettings', val); }
  },

  /** @type {Record<string, (this: Client, val: any) => any>} */
  defaultSettings: {
    get() { return this.db.get('guildSettings', 'default'); },
    set(val) { this.db.update('guildSettings', 'default', val); }
  },
  loadEnvAndDB: {
    /** @type {Client['loadEnvAndDB']}*/
    value: async function loadEnvAndDB() {
      let env;
      try { env = require('../env.json'); }
      catch (err) {
        if (err.code != 'MODULE_NOT_FOUND') throw err;

        this.db = await new DB().init(process.env.dbConnectionStr, 'db-collections', 100, log._log.bind(log, { file: 'debug', type: 'DB' }));
        env = this.db.get('botSettings', 'env');
      }

      env = deepMerge(env.global, env[env.global.environment]);
      this.db ??= await new DB().init(env.dbConnectionStr, 'db-collections', 100, log._log.bind(log, { file: 'debug', type: 'DB' }));

      if (!this.db.cache.size) {
        log('Database is empty, generating default data');
        await this.db.generate();
      }

      this.botType = env.environment;
      this.keys = env.keys;
    }
  },
  awaitReady: {
    /** @type {Client['awaitReady']}*/
    value: function awaitReady() {
      return new Promise(res => this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch())));
    }
  }
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  get() { return this.options.getFocused(true); },
  set(val) { this.options.data.find(e => e.focused).value = val; }
});
Object.defineProperty(Message.prototype, 'user', { get() { return this.author; } });
Object.assign(Message.prototype, { customReply, runMessages, _patch });
Object.defineProperties(User.prototype, {
  /** @type {Record<string, (this: User, val: any) => any>} */
  db: {
    get() { return this.client.db.get('userSettings', this.id) ?? {}; },
    set(val) { this.client.db.update('userSettings', this.id, val); }
  },

  /** @type {Record<string, (this: User, val: any) => any>} */
  customName: {
    get() { return this.db.customName ?? this.username; },
    set(val) { this.client.db.update('userSettings', 'customName', val); }
  }
});
Object.defineProperties(GuildMember.prototype, {
  /** @type {Record<string, (this: GuildMember, val: any) => any>} */
  db: {
    get() { return findAllEntries(this.guild.db, this.id); },
    set() { throw new Error('You cannot set a value to GuildMember#db!'); }
  },

  /** @type {Record<string, (this: GuildMember, val: any) => any>} */
  customName: {
    get() { return this.guild.db.customNames?.[this.id] ?? this.nickname ?? this.user.username; },
    set(val) { this.client.db.update('guildSettings', `${this.guild.id}.customNames.${this.id}`, val); }
  }
});
Object.defineProperties(Guild.prototype, {
  /** @type {Record<string, (this: Guild, val: any) => any>} */
  db: {
    get() { return this.client.db.get('guildSettings', this.id) ?? {}; },
    set(val) { this.client.db.update('guildSettings', this.id, val); }
  },

  /** @type {Record<string, (this: Guild, val: any) => any>} */
  localeCode: {
    get() { return this.db.config?.lang ?? this.preferredLocale.slice(0, 2) ?? this.client.defaultSettings.config.lang; },
    set(val) { this.client.db.update('guildSettings', 'config.lang', val); }
  }
});

Object.defineProperty(DB.prototype, 'generate', {
  /** @type {DB['generate']}*/
  value: async function generate(overwrite = false) {
    this.saveLog(`generating db files${overwrite ? ', overwriting existing data' : ''}`);
    await Promise.all(require('../Templates/db_collections.json').map(({ key, value }) => this.set(key, value, overwrite)));
  },
  enumerable: false
});
TicTacToe.prototype.playAgain = playAgain;

/**
 * @param {number}row
 * @param {number}col*/
GameBoardButtonBuilder.prototype.createButton = function createButton(row, col) {
  const
    button = new ButtonBuilder(),
    buttonIndex = row * this.boardSize + col,
    buttonData = this.boardData[buttonIndex];

  // Discord does not allow empty strings as label, this is a "ZERO WIDTH SPACE"
  if (buttonData === 0) button.setLabel('\u200B');
  else {
    if (this.customEmojies) button.setEmoji(this.emojies[buttonData]);
    else button.setLabel(this.buttonLabels[buttonData - 1]);

    if (this.disableButtonsAfterUsed) button.setDisabled(true);
  }
  return button.setCustomId(buttonIndex.toString()).setStyle(this.buttonStyles[buttonData]);
};