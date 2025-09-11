/* eslint-disable no-extend-native */
/* eslint no-underscore-dangle: [warn, {allow: [_patch, __count__, _log]}] */

const
  { AutocompleteInteraction, BaseInteraction, Client, Collection, Events, Guild, GuildMember, Message, User } = require('discord.js'),
  { randomInt } = require('node:crypto'),
  { readFile } = require('node:fs/promises'),
  { join } = require('node:path'),
  { parseEnv } = require('node:util'),
  { I18nProvider } = require('@mephisto5558/i18n'),
  { DB } = require('@mephisto5558/mongoose-db'),
  TicTacToe = require('discord-tictactoe'),
  { default: GameBoardButtonBuilder } = require('discord-tictactoe/dist/src/bot/builder/GameBoardButtonBuilder'),
  { setDefaultConfig } = require('../configValidator'),
  findAllEntries = require('../findAllEntries'),
  Log = require('./Log'),
  { playAgain, sendChallengeMention } = require('./TicTacToe_playAgain'),
  _patch = require('./message__patch'),
  customReply = require('./message_customReply'),
  { runMessages } = require('./message_runMessages'),

  defaultValueLoggingMaxJSONLength = 100,

  parentUptime = Number(process.argv.find(e => e.startsWith('uptime'))?.split('=')[1]) || 0;

module.exports = { Log, _patch, customReply, runMessages, playAgain, sendChallengeMention };

/** @type {import('.').LogInterface} */
globalThis.log = new Log();
globalThis.sleep = require('node:util').promisify(setTimeout);

const
  config = setDefaultConfig(),
  requiredEnv = [
    'environment',
    'humorAPIKey', 'rapidAPIKey',
    'githubKey', 'chatGPTApiKey',
    'dbdLicense',
    'dbConnectionStr', 'token', 'secret'
  ],

  overwrites = Object.fromEntries(Object.entries({
    globals: ['globalThis.sleep', 'globalThis.log()', 'globalThis.getEmoji()'], // TODO: getEmoji should probably not be global
    vanilla: [
      parentUptime ? 'process#childUptime, process#uptime (adding parent process uptime)' : undefined,
      'Array#random()', 'Array#unique()', 'Number#limit()', 'Number#inRange()',
      'Object#filterEmpty()', 'Object#__count__', 'BigInt#toJSON()'
    ],
    discordJs: [
      'Client#prefixCommands', 'Client#slashCommands', 'Client#backupSystem', 'Client#giveawaysManager', 'Client#webServer',
      'Client#cooldowns', 'Client#db', 'Client#i18n', 'Client#settings', 'Client#defaultSettings', 'Client#botType', 'Client#config',
      'Client#loadEnvAndDB()', 'Client#awaitReady()',
      'Message#originalContent', 'Message#args', 'Message#commandName', 'Message#user', 'Message#customReply()', 'Message#runMessages',
      'BaseInteraction#customReply()', 'AutocompleteInteraction#focused',
      'User#db', 'User#updateDB', 'User#deleteDB', 'User#customName', 'User#customTag', 'User#localeCode',
      'GuildMember#db', 'GuildMember#customName', 'GuildMember#customTag', 'GuildMember#localeCode',
      'Guild#db', 'Guild#updateDB()', 'Guild#deleteDB()', 'Guild#localeCode'
    ]
  }).map(([k, v]) => [k, v.filter(Boolean).join(', ')]));

if (!config.hideOverwriteWarning) {
  console.warn([
    'Overwriting the following variables and functions (if they exist):',
    `  Globals:    ${overwrites.globals}`,
    `  Vanilla:    ${overwrites.vanilla}`,
    `  Discord.js: ${overwrites.discordJs}`,
    '  Modifying Discord.js Message._patch method.'
  ].join('\n'));
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
    value: function limit({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
      return Math.min(Math.max(Number(this), min), max);
    },
    enumerable: false
  },
  inRange: {
    /** @type {global['Number']['prototype']['inRange']} */
    value: function inRange(min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
      return Number(this) > min && Number(this) < max;
    },
    enumerable: false
  }
});
Object.defineProperties(Object.prototype, {
  filterEmpty: {
    /** @type {global['Object']['prototype']['filterEmpty']} */
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
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive */
      for (const prop in this) if (Object.hasOwn(this, prop)) count++;

      return count;
    },
    enumerable: false
  }
});
Object.defineProperty(BigInt.prototype, 'toJSON', {
  /** @this {bigint} */
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

/* Note: Classes that re-reference client (e.g. GiveawaysManager, DB) MUST have a valueOf() function
   to prevent recursive JSON stringify'ing DoS'ing the whole node process */
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
          if (err.code == 'ENOENT') {
            throw new Error(
              `Missing "env.${process.env.environment}" file. Tried to import based on "environment" env variable in ".env".`,
              { cause: err }
            );
          }

          throw new Error(`Could not parse "env.${process.env.environment}" file.`, { cause: err });
        }
      }

      const missingEnv = requiredEnv.filter(e => !process.env[e]);
      if (missingEnv.length) throw new Error(`Missing environment variable(s) "${missingEnv.join('", "')}"`);

      const db = await new DB().init(
        process.env.dbConnectionStr, 'db-collections',
        defaultValueLoggingMaxJSONLength, log._log.bind(log, { file: 'debug', type: 'DB' })
      );
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
      return new Promise(res => void this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch())));
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
    get() {
      const locale = this.db.localeCode
        ?? Object.values(this.client.db.get('website', 'sessions')).find(e => e.user?.id == this.id)?.user?.locale
        ?? undefined; // website db user locale can be `null`

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
  },

  /** @type {Record<string, (this: GuildMember, val: import('@mephisto5558/i18n').Locale) => import('@mephisto5558/i18n').Locale>} */
  localeCode: {
    get() {
      return this.user.localeCode ?? this.guild.localeCode;
    },
    set(val) { void this.user.updateDB('localeCode', val); }
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
     * @this {Guild}
     * @param {string} key */
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
  /**
   * @type {import('@mephisto5558/mongoose-db').DB['generate']}
   * @this {DB} */
  value: async function generate(overwrite = false) {
    this.saveLog(`generating db files${overwrite ? ', overwriting existing data' : ''}`);
    await Promise.all(require('../../Templates/db_collections.json').map(async ({ key, value }) => void await this.set(key, value, overwrite)));
  }
});

// #endregion

// #region discord-tictactoe
Object.defineProperty(TicTacToe.prototype, 'playAgain', {
  value: playAgain
});

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
-- the library does not provide types */
const originalCreateButton = GameBoardButtonBuilder.prototype.createButton;
Object.defineProperty(GameBoardButtonBuilder.prototype, 'createButton', {
  /**
   * @this {unknown & { buttonLabels: [string, string, string] }}
   * @param {unknown[]} args */
  value: function createButton(...args) {
    this.buttonLabels[0] = '\u200B'; // Discord does not allow empty strings as label, this is a "ZERO WIDTH SPACE"

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    -- the library does not provide types */
    return originalCreateButton.call(this, ...args);
  }
});

// #endregion