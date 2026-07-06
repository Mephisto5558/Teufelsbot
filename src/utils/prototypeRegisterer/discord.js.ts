import { AutocompleteInteraction, BaseInteraction, Client, ClientApplication, Events, Guild, GuildMember, Message, User } from 'discord.js';
import { join } from 'node:path';
import { CommandManager, CooldownsManager } from '@mephisto5558/command';
import { I18nProvider } from '@mephisto5558/i18n';
import findAllEntries from '#utils/findAllEntries.ts';
import { loadEnvAndDB } from './client__loadEnvAndDB.ts';
import { _patch, customReply, runMessages } from './index.ts';

function createDbHandlers(class_: typeof User | typeof Guild): Partial<User | Guild> {
  const collection = class_ == User ? 'userSettings' : 'guildSettings';

  return {
    db: {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive from the DB lib */
      get(): unknown { return this.client.db.get(collection, this.id) ?? {}; },
      set(this: Guild | User, val: unknown): void { void this.updateDB(undefined, val); }
    },
    updateDB: {
      value: async function updateDB(key, value) {
        return this.client.db.update(collection, `${this.id}${key ? '.' + key : ''}`, value);
      } as User['updateDB'] | Guild['updateDB']
    },
    deleteDB: {
      value: async function deleteDB(key) {
        /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- safety */
        if (!key) throw new Error(`Missing key; cannot delete ${this.constructor.name} using this method!`);
        return this.client.db.delete(collection, `${this.id}.${key}`);
      } as User['deleteDB'] | Guild['deleteDB']
    }
  };
}


Object.defineProperty(BaseInteraction.prototype, 'customReply', {
  value: customReply
});

/* Note: Classes that re-reference client (e.g. GiveawaysManager, DB) MUST have a valueOf() function
   to prevent recursive JSON stringify'ing DoS'ing the whole node process */
Object.defineProperties(Client.prototype, {
  commandManager: { value: new CommandManager() },
  i18n: {
    value: new I18nProvider({
      notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: join(process.cwd(), 'Locales'),
      warnLoggingFunction: log.logToAll.bind(log, { file: 'warn', type: 'I18n' })
    })
  },
  cooldowns: { value: new CooldownsManager() },
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
    value: loadEnvAndDB
  },
  awaitReady: {
    /** @type {Client['awaitReady']} */
    value: async function awaitReady() {
      if (this.isReady()) return this.application.name ? this.application : this.application.fetch();
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