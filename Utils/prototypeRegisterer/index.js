/* eslint-disable no-extend-native */
const
  { BaseInteraction, Message, Collection, AutocompleteInteraction, User, Guild, GuildMember, ButtonBuilder, Events, Client } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  GameBoardButtonBuilder = require('discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder').default,
  { randomInt } = require('node:crypto'),
  { join } = require('node:path'),
  { parseEnv } = require('node:util'),
  { readFile } = require('node:fs/promises'),
  { DB } = require('@mephisto5558/mongoose-db'),
  { I18nProvider } = require('@mephisto5558/i18n'),
  Log = require('./Log.js'),
  customReply = require('./message_customReply.js'),
  { runMessages } = require('./message_runMessages.js'),
  _patch = require('./message__patch.js'),
  { playAgain, sendChallengeMention } = require('./TicTacToe_playAgain.js'),
  findAllEntries = require('../findAllEntries.js'),
  { setDefaultConfig } = require('../configValidator.js'),
  defaultValueLoggingMaxJSONLength = 100,

  parentUptime = Number(process.argv.find(e => e.startsWith('uptime'))?.split('=')[1]) || 0;

module.exports = { Log, _patch, customReply, runMessages, playAgain, sendChallengeMention };

globalThis.log = new Log();
globalThis.sleep = require('node:util').promisify(setTimeout);

const config = setDefaultConfig();

const requiredEnv = [
  'environment',
  'humorAPIKey', 'rapidAPIKey',
  'githubKey', 'chatGPTApiKey',
  'dbdLicense',
  'dbConnectionStr', 'token', 'secret'
];

if (!config.hideOverwriteWarning) {
  console.warn(
    'Overwriting the following variables and functions (if they exist):'
    + '\n  Globals:    global.sleep, global.log, global.getEmoji'
    + `\n  Vanilla:    ${parentUptime ? 'process#childUptime, process#uptime (adding parent process uptime),' : ''} Array#random, Array#unique, `
    + 'Number#limit, Number#inRange, Object#filterEmpty, Object#__count__, Function#bBind, BigInt#toJSON'
    + '\n  Discord.js: BaseInteraction#customReply, Message#user, Message#customReply, Message#runMessages, Client#prefixCommands, Client#slashCommands, Client#cooldowns, '
    + 'Client#loadEnvAndDB, Client#awaitReady, Client#defaultSettings, Client#settings, AutocompleteInteraction#focused, User#db, User#updateDB, User#localeCode, Guild#db, guild#updateDB, '
    + 'Guild#localeCode, GuildMember#db'
    + '\n  Modifying Discord.js Message._patch method.'
  );
}

if (parentUptime) {
  /* eslint-disable-next-line custom/unbound-method -- still on the same class */
  process.childUptime = process.uptime;
  process.uptime = function uptime() {
    return this.childUptime() + parentUptime;
  };
}

// #region BuildIn
Object.defineProperties(Array.prototype, {
  random: {
    /** @type {global['Array']['prototype']['random']} */
    value: function random() { return this[randomInt(this.length)]; },
    enumerable: false
  },
  unique: {
    /** @type {global['Array']['prototype']['unique']} */
    value: function unique() { return [...new Set(this)]; },
    enumerable: false
  }
});
Object.defineProperties(Number.prototype, {
  limit: {
    /** @type {global['Number']['prototype']['limit']} */
    value: function limit({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) { return Math.min(Math.max(Number(this), min), max); },
    enumerable: false
  },
  inRange: {
    /** @type {global['Number']['prototype']['inRange']} */
    value: function inRange(min, max) {
      let minRange, maxRange;
      if (typeof min == 'object') {
        maxRange = min.max;
        minRange = min.min;
      }

      return Number(this) > (minRange ?? min ?? Number.NEGATIVE_INFINITY) && Number(this) < (maxRange ?? max ?? Number.POSITIVE_INFINITY);
    },
    enumerable: false
  }
});
Object.defineProperties(Object.prototype, {
  /** @type {global['Object']['prototype']['filterEmpty']} */
  filterEmpty: {
    value: function filterEmpty() {
      return Object.entries(this).reduce((acc, [k, v]) => {
        if (!(v === null || (typeof v == 'object' && !v.__count__)))
          acc[k] = v instanceof Object ? v.filterEmpty() : v;
        return acc;
      }, {});
    },
    enumerable: false
  },
  __count__: {
    /** @type {global['Object']['prototype']['__count__']} */
    get: function get() {
      let count = 0;
      for (const prop in this) if (Object.hasOwn(this, prop)) count++;

      return count;
    },
    enumerable: false
  }
});
Object.defineProperty(Function.prototype, 'bBind', {
  /**
   * @type {global['Function']['prototype']['bBind']}
   * @this {CallableFunction} */
  value: function bBind(thisArg, ...args) {
    const bound = this.bind(thisArg, ...args);
    bound.__targetFunction__ = this;
    bound.__boundThis__ = thisArg;
    bound.__boundArgs__ = args;
    return bound;
  },
  enumerable: false
});
Object.defineProperty(BigInt.prototype, 'toJSON', {
  value: function stringify() {
    return this.toString();
  },
  enumerable: false
});

// #endregion

// #region Discord.js
Object.defineProperty(BaseInteraction.prototype, 'customReply', {
  value: customReply
});

// Note: Classes that re-reference client (e.g. GiveawaysManager, DB) MUST have a valueOf() function to prevent recursive JSON stringify'ing DoS'ing the whole node process
Object.defineProperties(Client.prototype, {
  prefixCommands: { value: new Collection() },
  slashCommands: { value: new Collection() },
  i18n: {
    value: new I18nProvider({
      notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: join(process.cwd(), 'Locales'),
      warnLoggingFunction: log._log.bind(log, { file: 'warn', type: 'I18n' })
    })
  },
  cooldowns: { value: new Map() },
  config: { value: config },

  /** @type {Record<string, (this: Client, val: any) => any>} */
  settings: {
    get() { return this.db.get('botSettings'); },
    set(val) { void this.db.set('botSettings', val); }
  },

  /** @type {Record<string, (this: Client, val: any) => any>} */
  defaultSettings: {
    get() { return this.db.get('botSettings', 'defaultGuild'); },
    set(val) { void this.db.update('botSettings', 'defaultGuild', val); }
  },
  loadEnvAndDB: {
    /** @type {Client['loadEnvAndDB']} */
    value: async function loadEnvAndDB() {
      process.loadEnvFile('.env');
      if (process.env.environment != 'main') {
        try {
          // process.loadEnvFile does not overwrite existing keys
          Object.assign(process.env, parseEnv(await readFile(`.env.${process.env.environment}`, { encoding: 'utf8' })));
        }
        catch (err) {
          if (err.code != 'ENOENT') throw new Error(`Missing "env.${process.env.environment}" file. Tried to import based on "environment" env variable in ".env".`);
          throw err;
        }
      }

      const missingEnv = requiredEnv.filter(e => !process.env[e]);
      if (missingEnv.length) throw new Error(`Missing environment variable(s) "${missingEnv.join('", "')}"`);

      const db = await new DB().init(process.env.dbConnectionStr, 'db-collections', defaultValueLoggingMaxJSONLength, log._log.bind(log, { file: 'debug', type: 'DB' }));
      if (!db.cache.size) {
        log('Database is empty, generating default data');
        await db.generate();
      }

      this.db = db;
      this.botType = process.env.environment;
    }
  },
  awaitReady: {
    /** @type {Client['awaitReady']} */
    value: async function awaitReady() {
      return new Promise(res => this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch())));
    }
  }
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  /** @this {AutocompleteInteraction} */
  get() { return this.options.getFocused(true); },

  /**
   * @this {AutocompleteInteraction}
   * @param {import('discord.js').AutocompleteInteraction['focused']['value']} val */
  set(val) { this.options.data.find(e => !!e.focused).value = val; }
});
Object.defineProperty(Message.prototype, 'user', {
  /** @this {Message} */
  get() { return this.author; }
});
Object.assign(Message.prototype, { customReply, runMessages, _patch });
Object.defineProperties(User.prototype, {
  /** @type {Record<string, (this: User, val: any) => any>} */
  db: {
    get() { return this.client.db.get('userSettings', this.id) ?? {}; },
    set(val) { void this.updateDB(undefined, val); }
  },
  updateDB: {
    /** @type {import('discord.js').User['updateDB']} */
    value: async function updateDB(key, value) { return this.client.db.update('userSettings', `${this.id}${key ? '.' + key : ''}`, value); }
  },
  deleteDB: {
    /** @type {import('discord.js').User['deleteDB']} */
    value: async function deleteDB(key) {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- just to be safe */
      if (!key) throw new Error('Missing key; cannot delete user using this method!');
      return this.client.db.delete('userSettings', `${this.id}.${key}`);
    }
  },

  /** @type {Record<string, (this: User, val: any) => any>} */
  customName: {
    get() { return this.db.customName ?? this.displayName; },
    set(val) { void this.updateDB('customName', val); }
  },

  /** @type {Record<string, (this: User, val: import('@mephisto5558/i18n').Locale) => import('@mephisto5558/i18n').Locale>} */
  localeCode: {
    // website db user locale can be `null`
    get() {
      const locale = this.db.localeCode ?? Object.values(this.client.db.get('website', 'sessions')).find(e => e.user?.id == this.id)?.user?.locale ?? undefined;
      return locale?.startsWith('en') ? 'en' : locale;
    },
    set(val) { void this.updateDB('localeCode', val); }
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
    get() { return this.guild.db.customNames?.[this.id] ?? this.displayName; },
    set(val) { void this.guild.updateDB(`customNames.${this.id}`, val); }
  }
});
Object.defineProperties(Guild.prototype, {
  /** @type {Record<string, (this: Guild, val: any) => any>} */
  db: {
    get() { return this.client.db.get('guildSettings', this.id) ?? {}; },
    set(val) { void this.updateDB(undefined, val); }
  },
  updateDB: {
    /**
     * @type {import('discord.js').Guild['updateDB']}
     * @this {Guild} */
    value: async function updateDB(key, value) { return this.client.db.update('guildSettings', `${this.id}${key ? '.' + key : ''}`, value); }
  },
  deleteDB: {
    /** @type {import('discord.js').Guild['deleteDB']} */
    value: async function deleteDB(key) {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- just to be safe */
      if (!key) throw new Error('Missing key; cannot delete guild using this method!');
      return this.client.db.delete('guildSettings', `${this.id}.${key}`);
    }
  },

  /** @type {Record<string, (this: Guild, val: import('discord.js').Guild['localeCode']) => import('discord.js').Guild['localeCode']>} */
  localeCode: {
    get() { return this.db.config.lang ?? (this.preferredLocale.startsWith('en') ? 'en' : this.preferredLocale); },
    set(val) { void this.updateDB('config.lang', val); }
  }
});

// #endregion

// #region mongoose-db
Object.defineProperty(DB.prototype, 'generate', {
  /** @type {import('@mephisto5558/mongoose-db').DB['generate']} */
  value: async function generate(overwrite = false) {
    this.saveLog(`generating db files${overwrite ? ', overwriting existing data' : ''}`);
    await Promise.all(require('../../Templates/db_collections.json').map(({ key, value }) => this.set(key, value, overwrite)));
  }
});

// #endregion

// #region discord-tictactoe
Object.defineProperty(TicTacToe.prototype, 'playAgain', {
  value: playAgain
});

Object.defineProperty(GameBoardButtonBuilder.prototype, 'createButton', {
  /**
   * @param {number} row
   * @param {number} col */
  value: function createButton(row, col) {
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
  }
});

// #endregion