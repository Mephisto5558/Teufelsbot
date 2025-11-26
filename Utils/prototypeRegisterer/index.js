/* eslint-disable no-extend-native */
/* eslint no-underscore-dangle: [warn, {allow: [_patch, __count__, _log]}] */

/**
 * @import { DB as DBT } from '@mephisto5558/mongoose-db'
 * @import i18n from '@mephisto5558/i18n'
 * @import { Guild, User, AutocompleteInteraction as AutocompleteInteractionT, ClientApplication as ClientApplicationT } from 'discord.js'
 * @import { LogInterface } from '.' */

const
  {
    AutocompleteInteraction, BaseInteraction, Client, ClientApplication, Collection, Events, Guild, GuildMember, Message, User
  } = require('discord.js'),
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
  runMessages = require('./message_runMessages'),

  defaultValueLoggingMaxJSONLength = 100,

  parentUptime = Number(process.argv.find(e => e.startsWith('uptime'))?.split('=')[1]) || 0;

module.exports = { Log, _patch, customReply, runMessages, playAgain, sendChallengeMention };

/** @type {LogInterface} */
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
    globals: ['globalThis.sleep()', 'globalThis.log()'],
    vanilla: [
      parentUptime ? 'process#childUptime, process#uptime (adding parent process uptime)' : undefined,
      'Array#random()', 'Array#unique()', 'Number#limit()', 'Number#inRange()', 'Object#__count__', 'BigInt#toJSON()'
    ],
    discordJs: [
      'Client#prefixCommands', 'Client#slashCommands', 'Client#backupSystem', 'Client#giveawaysManager', 'Client#webServer',
      'Client#cooldowns', 'Client#db', 'Client#i18n', 'Client#settings', 'Client#defaultSettings', 'Client#botType', 'Client#config', 'Client#prefix',
      'Client#loadEnvAndDB()', 'Client#awaitReady()', 'ClientApplication#getEmoji()',
      'Message#originalContent', 'Message#args', 'Message#commandName', 'Message#user', 'Message#customReply()', 'Message#runMessages',
      'BaseInteraction#customReply()', 'AutocompleteInteraction#focused',
      'User#localeCode', 'User#db', 'User#updateDB()', 'User#deleteDB()',
      'GuildMember#db', 'GuildMember#localeCode',
      'Guild#localeCode', 'Guild#prefix', 'Guild#db', 'Guild#updateDB()', 'Guild#deleteDB()'
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
    value: function random() { return this.length ? this[randomInt(this.length)] : undefined; },
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
  __count__: {
    /** @type {(this: object) => number} */
    get: function get() {
      let count = 0;
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
/** @param {User | Guild} class_ */
function createDbHandlers(class_) {
  const collection = class_ == User ? 'userSettings' : 'guildSettings';

  return {
    /** @type {Record<string, (this: User | Guild, val: unknown) => unknown>} */
    db: {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive from the DB lib */
      get() { return this.client.db.get(collection, this.id) ?? {}; },
      set(val) { void this.updateDB(undefined, val); }
    },
    updateDB: {
      // note that this type is not quite correct, but `(import('discord.js').User | import('discord.js').Guild)['updateDB'] does not work`
      /** @type {User['updateDB']} */
      value: async function updateDB(key, value) {
        return this.client.db.update(collection, `${this.id}${key ? '.' + key : ''}`, value);
      }
    },
    deleteDB: {
      // note that this type is not quite correct, but `(import('discord.js').User | import('discord.js').Guild)['deleteDB'] does not work`
      /** @type {Guild['deleteDB']} */
      value: async function deleteDB(key) {
        if (!key) throw new Error(`Missing key; cannot delete ${this.constructor.name} using this method!`);
        return this.client.db.delete(collection, `${this.id}.${key}`);
      }
    }
  };
}


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
  config: { value: config, writable: true },

  /** @type {Record<string, (this: Client, val: unknown) => unknown>} */
  settings: {
    get() { return this.db.get('botSettings'); },
    set(val) { void this.db.set('botSettings', val); }
  },

  /** @type {Record<string, (this: Client, val: unknown) => unknown>} */
  defaultSettings: {
    get() { return this.db.get('botSettings', 'defaultGuild'); },
    set(val) { void this.db.update('botSettings', 'defaultGuild', val); }
  },

  /** @type {Record<string, (this: Client, val: unknown) => unknown>} */
  prefixes: {
    get() {
      return this.db.get('botSettings', `defaultGuild.config.prefixes.${this.botType}`)
        ?? this.db.get('botSettings', 'defaultGuild.config.prefixes.main');
    },
    set() { throw new Error('You cannot set a value to Client#prefixes!'); }
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
Object.defineProperty(ClientApplication.prototype, 'getEmoji', {
  /** @type {ClientApplicationT['getEmoji']} */
  value: function getEmoji(emoji) {
    return this.emojis.cache.find(e => e.name == emoji)?.toString();
  }
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  /** @this {AutocompleteInteraction} */
  get() { return this.options.getFocused(true); },

  /**
   * @this {AutocompleteInteractionT}
   * @param {AutocompleteInteractionT['focused']['value']} val */
  set(val) { this.options.data.find(e => !!e.focused).value = val; }
});
Object.defineProperty(Message.prototype, 'user', {
  /** @this {Message} */
  get() { return this.author; }
});
Object.assign(Message.prototype, { customReply, runMessages, _patch });
Object.defineProperties(User.prototype, {
  ...createDbHandlers(User),

  /** @type {Record<string, (this: User, val: i18n.Locale) => i18n.Locale>} */
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
  /** @type {Record<string, (this: GuildMember, val: unknown) => unknown>} */
  db: {
    get() { return findAllEntries(this.guild.db, this.id); },
    set() { throw new Error('You cannot set a value to GuildMember#db!'); }
  },

  /** @type {Record<string, (this: GuildMember, val: i18n.Locale) => i18n.Locale>} */
  localeCode: {
    get() {
      return this.user.localeCode ?? this.guild.localeCode;
    },
    set(val) { void this.user.updateDB('localeCode', val); }
  }
});
Object.defineProperties(Guild.prototype, {
  ...createDbHandlers(Guild),

  /** @type {Record<string, (this: Guild, val: Guild['localeCode']) => Guild['localeCode']>} */
  localeCode: {
    get() { return this.db.config.lang ?? (this.preferredLocale.startsWith('en') ? 'en' : this.preferredLocale); },
    set(val) { void this.updateDB('config.lang', val); }
  },

  /** @type {Record<string, (this: Guild, val: unknown) => unknown>} */
  prefixes: {
    get() { return this.db.config.prefixes?.[this.client.botType] ?? this.client.prefixes; },
    set() { throw new Error('You cannot set a value to Guild#prefixes!'); }
  }
});

// #endregion

// #region mongoose-db
Object.defineProperty(DB.prototype, 'generate', {
  /**
   * @type {DBT['generate']}
   * @this {DBT} */
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