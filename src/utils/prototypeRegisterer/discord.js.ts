import { AutocompleteInteraction, BaseInteraction, Client, ClientApplication, Events, Guild, GuildMember, Message, User } from 'discord.js';
import { join } from 'node:path';
import { CommandManager, CooldownsManager } from '@mephisto5558/command';
import { I18nProvider, Locale } from '@mephisto5558/i18n';
import findAllEntries from '#utils/findAllEntries.ts';
import { loadEnvAndDB } from './client__loadEnvAndDB.ts';
import { _patch, customReply, runMessages } from './index.ts';

function createDbHandlers(class_: typeof User | typeof Guild): Partial<User | Guild> {
  const collection = class_ == User ? 'userSettings' : 'guildSettings';

  return {
    db: {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive from the DB lib */
      get(this: Guild | User): unknown { return this.client.db.get(collection, this.id) ?? {}; },
      set(this: Guild | User, val: unknown): void { void this.updateDB(undefined, val); }
    },
    updateDB: {
      value: async function updateDB(key: string, value: unknown) {
        return this.client.db.update(collection, `${this.id}${key ? '.' + key : ''}`, value);
      } as User['updateDB'] | Guild['updateDB']
    },
    deleteDB: {
      value: async function deleteDB(this: Guild | User, key: string) {
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

  settings: {
    get(): unknown { return this.db.get('botSettings'); },
    set(val): void { void this.db.set('botSettings', val); }
  } satisfies Record<string, (this: Client, val: unknown) => unknown>,

  defaultSettings: {
    get(): unknown { return this.db.get('botSettings', 'defaultGuild'); },
    set(val): void { void this.db.update('botSettings', 'defaultGuild', val); }
  } satisfies Record<string, (this: Client, val: unknown) => unknown>,

  prefixes: {
    get(): unknown {
      return this.db.get('botSettings', `defaultGuild.config.prefixes.${this.botType}`)
        ?? this.db.get('botSettings', 'defaultGuild.config.prefixes.main');
    },
    set(): void { throw new Error('You cannot set a value to Client#prefixes!'); }
  } satisfies Record<string, (this: Client, val: unknown) => unknown>,

  loadEnvAndDB: {
    value: loadEnvAndDB
  },
  awaitReady: {
    value: async function awaitReady(): Promise<ClientApplication> {
      if (this.isReady()) return this.application.name ? this.application : this.application.fetch();
      return new Promise(res => void this.once(Events.ClientReady, () => res(this.application.name ? this.application : this.application.fetch())));
    } satisfies Client['awaitReady']
  }
});
Object.defineProperty(ClientApplication.prototype, 'getEmoji', {
  value: function getEmoji(emoji): string | undefined {
    return this.emojis.cache.find(e => e.name == emoji)?.toString();
  } satisfies ClientApplication['getEmoji']
});
Object.defineProperty(AutocompleteInteraction.prototype, 'focused', {
  get(): AutocompleteInteraction['focused'] { return this.options.getFocused(true); },
  set(val): void { this.options.data.find(e => !!e.focused)!.value = val; }
} satisfies Record<string, (this: AutocompleteInteraction, val: AutocompleteInteraction['focused']['value']) => unknown>);
Object.defineProperty(Message.prototype, 'user', {
  get(this: Message): User { return this.author; }
});
Object.assign(Message.prototype, { customReply, runMessages, _patch });
Object.defineProperties(User.prototype, {
  ...createDbHandlers(User),

  localeCode: {
    get(): Locale {
      const locale = this.db.localeCode
        ?? Object.values(this.client.db.get('website', 'sessions')).find(e => e.user?.id == this.id)?.user?.locale
        ?? undefined; // website db user locale can be `null`

      return locale?.startsWith('en') ? 'en' : locale;
    },
    set(val): void { void this.updateDB('localeCode', val); }
  } satisfies Record<string, (this: User, val: Locale) => Locale>
});
Object.defineProperties(GuildMember.prototype, {
  db: {
    get(): Record<string, unknown> { return findAllEntries(this.guild.db, this.id); },
    set(): void { throw new Error('You cannot set a value to GuildMember#db!'); }
  } satisfies Record<string, (this: GuildMember, val: unknown) => unknown>,

  localeCode: {
    get(): Locale {
      return this.user.localeCode ?? this.guild.localeCode;
    },
    set(val): void { void this.user.updateDB('localeCode', val); }
  } satisfies Record<string, (this: GuildMember, val: Locale) => Locale>
});
Object.defineProperties(Guild.prototype, {
  ...createDbHandlers(Guild),

  localeCode: {
    get(): Locale { return this.db.config.lang ?? (this.preferredLocale.startsWith('en') ? 'en' : this.preferredLocale); },
    set(val) { void this.updateDB('config.lang', val); }
  } satisfies Record<string, (this: Guild, val: Guild['localeCode']) => Guild['localeCode']>,

  prefixes: {
    get(): prefixes[] { return this.db.config.prefixes?.[this.client.botType] ?? this.client.prefixes; },
    set(): void { throw new Error('You cannot set a value to Guild#prefixes!'); }
  } satisfies Record<string, (this: Guild, val: unknown) => unknown>;
});