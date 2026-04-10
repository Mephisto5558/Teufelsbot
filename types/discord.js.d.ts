/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type {
  AutocompleteFocusedOption, BaseInteraction, Guild, InteractionReplyOptions, Message, MessageEditOptions,
  MessageMentionOptions, MessagePayload, User
} from 'discord.js';
import type { CommandManager, CooldownsManager } from '@mephisto5558/command';
import type { I18nProvider, Locale as LangLocaleCode } from '@mephisto5558/i18n';
import type { DB, GetValueByKey } from '@mephisto5558/mongoose-db';

import type { BackupSystem, GiveawaysManager } from '#Utils';
import type { runMessages as TRunMessages } from '#Utils/prototypeRegisterer';
import type locals from './locals';

export interface CustomClient<Ready extends boolean = boolean> {
  commandManager: CommandManager;
  backupSystem?: BackupSystem.BackupSystem;
  giveawaysManager?: GiveawaysManager;

  /** `undefined` if `this.botType == 'dev'` */
  webServer?: locals.WebServer<Ready>;
  cooldowns: CooldownsManager;
  db: DB<Database>;
  i18n: I18nProvider;
  botType: NodeJS.ProcessEnv['environment'];

  get settings(): Database['botSettings'];
  get defaultSettings(): Database['botSettings']['defaultGuild'];
  get prefixes(): Database['botSettings']['defaultGuild']['config']['prefixes'][string];

  /** The config from {@link ./config.json}. */
  config: locals.Config;
  loadEnvAndDB(this: StrictOmit<CustomClient<Ready>, 'db'>): Promise<void>;

  /**
   * A promise that resolves to a fetched discord application once
   * {@link https://discord.js.org/docs/packages/discord.js/14.14.1/Client:Class#clientReady Client#clientReady}
   * was emitted. */
  awaitReady(this: CustomClient<Ready>): Promise<CustomClientApplication>;
}

export interface CustomClientApplication {
  client: Client;

  /** Get an application Emoji's mention by it's name. Requires the ApplicationEmojiManager's cache to be populated. */
  getEmoji<NAME extends string>(this: CustomClientApplication, emoji: NAME): `<a:${NAME}:${Snowflake}>` | `<${NAME}:${Snowflake}>` | undefined;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- consistency with `@mephisto5558/command` */
export interface CustomMessage<InGuild extends boolean = boolean> {
  client: Client;

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
  commandName: Lowercase<string> | null;

  /** Alias for {@link Message.author} */
  user: Message['author'];


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

export interface CustomPartialMessage<InGuild extends boolean = boolean> {
  client: Client;

  user: PartialMessage['author'];
  inGuild(): InGuild;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- consistency with `@mephisto5558/command` */
export interface CustomBaseInteraction<Cached extends CacheType = CacheType> {
  client: Client;

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

export interface CustomAutocompleteInteraction<Cached extends CacheType = CacheType> extends CustomBaseInteraction<Cached> {

  /**
   * ```js
   * this.options.getFocused(true)
   * ``` */
  get focused(): AutocompleteFocusedOption;
}

export interface CustomUser {
  client: Client;

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
    this: User, key: K,
    value: K extends undefined
      ? NonNullable<Database['userSettings'][Snowflake]>
      : GetValueByKey<NonNullable<Database['userSettings'][Snowflake]>, K>
  ): Promise<Database['userSettings']>;

  deleteDB(this: User, key: locals.FlattenedUserSettings): ReturnType<DB<Database>['delete']>;

  get localeCode(): LangLocaleCode | undefined;
}

export interface CustomGuildMember {
  client: Client;

  /** Searches the guildSettings DB recursively for all data of this member across all guilds. */
  get db(): Record<string, unknown> | undefined;

  /**
   * ```js
   *  this.user.localeCode ?? this.guild.localeCode
   * ``` */
  get localeCode(): LangLocaleCode | undefined;
}

export interface CustomGuild {
  client: Client;

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
    this: Guild, key: K,
    value: K extends undefined
      ? NonNullable<Database['guildSettings'][Snowflake]>
      : Exclude<GetValueByKey<NonNullable<Database['guildSettings'][Snowflake]>, K>, undefined>
  ): Promise<Database['guildSettings']>;

  deleteDB(this: Guild, key: locals.FlattenedGuildSettings): ReturnType<DB<Database>['delete']>;

  get localeCode(): LangLocaleCode;
  get prefixes(): NonNullable<Database['guildSettings'][Snowflake]['config']['prefixes']>[string];
}

declare module 'discord.js' {
  /* eslint-disable @typescript-eslint/no-empty-object-type -- extending to get modified properties */

  interface Client<Ready extends boolean = boolean> extends CustomClient<Ready> {}
  interface ClientApplication extends CustomClientApplication {}
  interface Message<InGuild extends boolean = boolean> extends CustomMessage<InGuild> {}
  interface PartialMessage<InGuild extends boolean = boolean> extends CustomPartialMessage<InGuild> {}
  interface BaseInteraction<Cached extends CacheType = CacheType> extends CustomBaseInteraction<Cached> {}
  interface AutocompleteInteraction<Cached extends CacheType = CacheType> extends CustomAutocompleteInteraction<Cached> {}
  interface User extends CustomUser {}
  interface GuildMember extends CustomGuildMember {}
  interface Guild extends CustomGuild {}

  /* eslint-enable @typescript-eslint/no-empty-object-type */
}