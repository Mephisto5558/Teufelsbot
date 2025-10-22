/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type Discord from 'discord.js';
import type { WebServer } from '@mephisto5558/bot-website';
import type { I18nProvider, Locale as LangLocaleCode } from '@mephisto5558/i18n';
import type DB, { GetValueByKey } from '@mephisto5558/mongoose-db';

import type { BackupSystem, GiveawaysManager } from '#Utils';
import type { runMessages as TRunMessages } from '#Utils/prototypeRegisterer';
import type locals from './locals';

// Source: https://github.com/microsoft/TypeScript/issues/54451#issue-1732749888
export type Omit<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };

// Source: https://github.com/Mephisto5558/Teufelsbot/blob/21fe71d254beb4d7a2c6f32f1add26947879290b/types/discord.js.d.ts#L11-L20
/* eslint-disable @typescript-eslint/ban-ts-comment -- depending on the module resolution, one of these might not error out. */
declare module '../node_modules/discord.js/node_modules/discord-api-types/v10' {
  // @ts-ignore 2300 // overwriting Snowflake
  export type Snowflake = globalThis.Snowflake;
}
declare module 'discord-api-types/v10' {
  // @ts-ignore 2300 // overwriting Snowflake
  export type Snowflake = globalThis.Snowflake;
}
/* eslint-enable @typescript-eslint/ban-ts-comment */

declare module 'discord.js' {
  interface Client<Ready> {
    prefixCommands: Discord.Collection<command['name'], command<'prefix', boolean, Ready>>;
    slashCommands: Discord.Collection<command['name'], command<'slash', boolean, Ready>>;
    backupSystem?: BackupSystem.BackupSystem;
    giveawaysManager?: GiveawaysManager;

    /** `undefined` if `this.botType == 'dev'` */
    webServer?: WebServer;
    cooldowns: Map<string, Record<string, Map<string, number>>>;
    db: DB<Database>;
    i18n: I18nProvider;
    settings: Database['botSettings'];
    defaultSettings: Database['botSettings']['defaultGuild'];
    botType: NodeJS.ProcessEnv['environment'];

    /** The config from {@link ./config.json}. */
    config: locals.Config;
    loadEnvAndDB(this: Omit<Client<Ready>, 'db'>): Promise<void>;

    /**
     * A promise that resolves to a fetched discord application once
     * {@link https://discord.js.org/docs/packages/discord.js/14.14.1/Client:Class#clientReady Client#clientReady}
     * was emitted. */
    awaitReady(this: Client<Ready>): Promise<ClientApplication>;
  }

  interface Message {

    /**
     * The original content of the message. This is a custom property set in 'prototypeRegisterer.js'.
     *
     * This property requires the GatewayIntentBits.MessageContent privileged intent
     * for guild messages that do not mention the client. */
    originalContent: string | null;

    /**
     * The arguments of the message. It slices out the prefix and splits the message content on spaces.
     * This is a custom property set in 'prototypeRegisterer.js'. */
    args: string[];

    /**
     * The first word of the {@link Message.originalContent original content}.
     * `null` if the content is empty. This is a custom property set in 'prototypeRegisterer.js'. */
    commandName: string | null;

    /** Alias for {@link Message.author} */
    user: Message['author'];

    /** This does not exist on Messages and is only for better typing of {@link command} here */
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- valid use case, as this property does not really exist */
    options: void;


    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     *
     * Sends the content as a file if it is larger than the maximum allowed message length (2000).
     * If that is the case and the content is just one codeblock, it will strip the codeblock and send a file in the codeblock's language format.
     * @param deleteTime Number in Milliseconds */
    customReply(
      this: Message,
      options: string | MessagePayload | MessageEditOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;

    runMessages: typeof TRunMessages;
  }

  interface PartialMessage {
    user: PartialMessage['author'];
    inGuild(): boolean;
  }

  interface BaseInteraction {

    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     *
     * Sends the content as a file if it is larger than the maximum allowed message length (2000).
     * If that is the case and the content is just one codeblock, it will strip the codeblock and send a file in the codeblock's language format.
     * @param deleteTime Number in Milliseconds */
    customReply(
      this: BaseInteraction,
      options: string | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;
  }

  interface AutocompleteInteraction {

    /**
     * ```js
     * this.options.getFocused(true)
     * ``` */
    get focused(): AutocompleteFocusedOption;
  }

  interface User {

    /**
     * ```js
     * this.client.db.get('userSettings', this.id) ?? {}
     * ``` */
    get db(): NonNullable<Database['userSettings'][Snowflake]>;

    /**
     * ```js
     * return this.client.db.update('userSettings', `${this.id}.${key}`, value);
     * ``` */
    updateDB<K extends locals.FlattenedUserSettings | undefined>(
      this: User, key: K, value: GetValueByKey<NonNullable<Database['userSettings'][Snowflake]>, K>
    ): Promise<Database['userSettings']>;

    deleteDB(this: User, key: locals.FlattenedUserSettings): ReturnType<DB<Database>['delete']>;

    customName: string;
    customTag: string;

    get localeCode(): LangLocaleCode | undefined;
  }

  interface GuildMember {

    /** Searches the guildSettings DB recursively for all data of this member across all guilds. */
    get db(): Record<string, unknown> | undefined;
    customName: string;
    customTag: string;

    /**
     * ```js
     *  this.user.localeCode ?? this.guild.localeCode
     * ``` */
    get localeCode(): LangLocaleCode | undefined;
  }

  interface Guild {

    /**
     * ```js
     * this.client.db.get('guildSettings', this.id) ?? {}
     * ``` */
    get db(): NonNullable<Database['guildSettings'][Snowflake]>;

    /**
     * ```js
     * return this.client.db.update('guildSettings', `${this.id}.${key}`, value);
     * ``` */
    updateDB<K extends locals.FlattenedGuildSettings | undefined>(
      this: Guild, key: K, value: GetValueByKey<NonNullable<Database['guildSettings'][Snowflake]>, K>
    ): Promise<Database['guildSettings']>;

    deleteDB(this: Guild, key: locals.FlattenedGuildSettings): ReturnType<DB<Database>['delete']>;

    localeCode: LangLocaleCode;
  }
}