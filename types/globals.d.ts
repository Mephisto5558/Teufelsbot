/* eslint-disable max-lines */

import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type { WebServer } from '@mephisto5558/bot-website';

// import type Command from '@mephisto5558/command';
import type DBStructure from './database';
import type { BackupSystem, GiveawaysManager } from '#Utils';
import type { runMessages as TRunMessages } from '#Utils/prototypeRegisterer';

type ISODate = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type ISOTime = `${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}`;
type ISODateTime = `${ISODate}T${ISOTime}Z`;

// #region __local
declare namespace __local {
  type autocompleteOptions = string | number | { name: string; value: string };

  type BaseCommand<initialized extends boolean = boolean> = {

    /** Numbers in milliseconds*/
    cooldowns?: { guild?: number; channel?: number; user?: number };

    /** Makes the command also work in direct messages.*/
    dmPermission?: boolean;

    /** Beta commands are the only commands that get loaded when `client.env == 'dev'`.*/
    beta?: boolean;

    /** This command will not be loaded*/
    disabled?: boolean;

    /** If enabled in {@link ./config.json} and set here, will be shown to the user when they try to run the command.*/
    disabledReason?: string;

    /** Slash command options*/
    options?: commandOptions<initialized>[];
  }
  & (initialized extends true ? {

    /**
     * Gets set to the command's filename.
     * For slash commands, must be lowercase.*/
    name: string;

    /** Currently not used*/
    nameLocalizations?: Record<string, BaseCommand<true>['name']>;

    /**
     * Gets set automatically from language files.
     * For slash commands, can not be longer then 100 chars.*/
    description: string;

    /**
     * Gets set automatically from language files.
     * `undefined` only for an unknown language
     * @see {@link command.description}*/
    descriptionLocalizations: Record<string, BaseCommand<true>['description'] | undefined>;

    /**
     * Command usage information for the end-user.
     * Should be in the command file if its language-independent, otherwise in the language files.
     *
     * Gets modified upon initialization.*/
    usage: { usage?: string; examples?: string };


    /**
     * Gets set automatically from language files.
     * @see {@link command.usage}*/
    usageLocalizations: Record<string, BaseCommand['usage']>;

    /** Gets set to the lowercase folder name the command is in.*/
    category: string;

    permissions?: {
      client?: Discord.PermissionFlags[];
      user?: Discord.PermissionFlags[];
    };

    /**
     * **Do not set manually.**
     *
     * If the command is an alias, this property will have the original name.*/
    aliasOf?: BaseCommand['name'];

    /**
     * **Do not set manually.**
     *
     * The command's full file path, used for e.g. reloading the command.*/
    filePath: string;
  } : {

    /** @deprecated Change the filename to the desired name instead.*/
    name?: string;

    /** @deprecated Use language files instead.*/
    description?: string;

    usage?: { usage?: string; examples?: string };

    /** @deprecated Change the directory name to the desired category instead.*/
    category?: string;

    permissions?: {
      client?: (keyof Discord.PermissionFlags)[];
      user?: (keyof Discord.PermissionFlags)[];
    };
  });

  interface Config {
    /** Will always include the bot's user id and the application owner id*/
    devIds: Set<Snowflake>;
    website: {
      baseDomain?: string;
      domain?: string;
      port?: string;
      dashboard?: string;
      privacyPolicy?: string;
      invite?: string;
    };
    github: {
      repo?: string;
      userName?: string;
      repoName?: string;
    };

    /** @default ['owner-only']*/
    ownerOnlyFolders: string[];
    discordInvite?: string;
    mailAddress?: string;
    hideOverwriteWarning?: boolean;
    hideNonBetaCommandLog?: boolean;
    hideDisabledCommandLog?: boolean;

    /** @default true*/
    replyOnDisabledCommand: boolean;

    /** @default true*/
    replyOnNonBetaCommand: boolean;
    disableWebserver?: boolean;
    enableConsoleFix?: boolean;
  }

  interface Env {
    environment: string;
    keys: {
      humorAPIKey: string;
      rapidAPIKey: string;
      githubKey: string;
      chatGPTAPIKey: string;
      dbdLicense: string;
      votingWebhookURL?: string;
      token: string;
      secret: string;
    };
    dbConnectionStr: string;
  }

  // @ts-expect-error 2681
  type BoundFunction = new (this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang) => FunctionConstructor;

  type FlattenedGuildSettings = DBStructure.FlattenObject<NonNullable<Database['guildSettings'][Snowflake]>>;
  type FlattenedUserSettings = DBStructure.FlattenObject<NonNullable<Database['userSettings'][Snowflake]>>;
}

// #endregion

// #region global
declare global {
  // #region Buildins
  namespace NodeJS {
    interface Process {

      /** The real process uptime. This property only exists if process args include uptime=...*/
      childUptime?(): number;

      /**
       * If `process.childUptime` exists (process args includes uptime=...), this is
       *
       * `process.childUptime() + parentUptime`
       *
       * Otherwise it is the default `process.uptime()`*/
      uptime(): number;
    }
  }

  interface Array<T> {

    /**
     * Gets a random array element by generating a cryptographically secure random number using {@link https://nodejs.org/api/crypto.html node:crypto}.
     * May return undefined if the array is empty.*/
    random(this: T[]): T | undefined;
  }

  interface Number {
    limit(options?: { min?: number; max?: number }): number;

    /** @returns If the number is more than `min` and less than `max`.*/
    inRange(options: { min?: number; max?: number }): boolean;
    inRange(min?: number, max?: number): boolean;
  }

  interface Object {
    /** Removes `null`, `undefined`, empty arrays and empty objects recursively.*/
    filterEmpty(this: object): object;

    /** The amount of items in the object.*/
    __count__: number;
  }

  interface Function {
    // Only typing | Fixes return types | https://github.com/microsoft/TypeScript/blob/c790dc1dc7ff67e619a5a60fc109b7548f171322/src/lib/es5.d.ts#L313

    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     */
    apply<T, R>(this: (this: T) => R, thisArg: T): R;

    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args An array of argument values to be passed to the function.
     */
    apply<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, args: AX[]): R;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): R;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, AX>(this: new (...args: AX[]) => T, thisArg: T, ...args: AX[]): void;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object.*/
    bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
    bind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): (...args: AX[]) => R;

    /** A wrapper for {@link Function.prototype.bind}. @see {@link bBoundFunction}*/
    bBind<T extends GenericFunction>(this: T, thisArg: ThisParameterType<T>): bBoundFunction<T>;
    bBind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): bBoundFunction<(this: T, ...args: AX[]) => R>;
  }

  interface Date {
    /**
     * Give a more precise return type to the method `toISOString()`:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString     */
    toISOString(): ISODateTime;
  }

  // #endregion

  // #region custom
  const sleep: (ms: number) => Promise<void>;

  /** Custom logging, including logfiles.*/
  const log: {
    /* eslint-disable @typescript-eslint/no-explicit-any -- using same signature as console.log */
    (...str: any[]): typeof log;
    log(...str: any[]): typeof log;
    warn(...str: any[]): typeof log;
    error(...str: any[]): typeof log;
    debug(...str: any[]): typeof log;
    _log({ file, type }?: { file?: string; type?: string }, ...str: any[]): typeof log;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  type Snowflake = Discord.Snowflake;

  type Database = DBStructure.Database;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type GenericFunction = (...args: any) => any;

  /* type SlashCommand = Command.SlashCommand;
     type PrefixCommand = Command.PrefixCommand;
     type MixedCommand = Command.MixedCommand;
     type CommandOptions = Command.CommandOptions; */

  type langBoundArgs = [ { locale?: string; errorNotFound?: boolean; undefinedNotFound?: boolean; backupPath?: string } ];

  /** {@link Function.prototype.bBind bBind}ed {@link I18nProvider.__} function*/
  type lang = bBoundFunction<I18nProvider['__'], (this: I18nProvider, key: string, replacements?: string | object) => string> & { __boundArgs__: langBoundArgs };

  /** same as {@link lang}, but may return `undefined` due to undefinedNotFound being true on the {@link I18nProvider.__ original function}.*/
  type langUNF = bBoundFunction<I18nProvider['__'], (this: I18nProvider, key: string, replacements?: string | object) => string | undefined> & { __boundArgs__: langBoundArgs };

  // #endregion

  // #region commands
  type slashCommand<initialized extends boolean = false> = __local.BaseCommand<initialized> & {
    slashCommand: true;
    aliases?: { slash?: __local.BaseCommand['name'][] };

    /** Do not deferReply to the interaction*/
    noDefer?: boolean;

    /**
     * Do `interaction.deferReply({ ephemeral: true })`.
     *
     * Gets ignored if {@link command.noDefer} is `true`.*/
    ephemeralDefer?: boolean;
  } & (initialized extends true ? {

    /** **Do not set manually.***/
    id: Snowflake;

    /** **Do not set manually.***/
    type: Discord.ApplicationCommandType.ChatInput;

    defaultMemberPermissions: Discord.PermissionsBitField;

    dmPermission: boolean;
  } : object);

  type prefixCommand<initialized extends boolean = false> = __local.BaseCommand<initialized> & {
    prefixCommand: true;
    aliases?: { prefix?: __local.BaseCommand['name'][] };
  };

  type command<commandType extends 'prefix' | 'slash' | 'both' = 'both', guildOnly extends boolean = true, initialized extends boolean = false> = __local.BaseCommand<initialized>
    & (commandType extends 'slash' | 'both' ? slashCommand<initialized> : object)
    & (commandType extends 'prefix' | 'both' ? prefixCommand<initialized> : object)
    & { run(
      this: commandType extends 'slash'
        ? Interaction<guildOnly>
        : commandType extends 'prefix'
          ? Message<guildOnly extends true ? true : boolean>
          : Interaction<guildOnly> | Message<guildOnly extends true ? true : boolean>,
      lang: lang, client: Discord.Client<true>
    ): Promise<never>; };

  type commandOptions<initialized extends boolean = boolean> = {
    name: string;

    /** Numbers in milliseconds*/
    cooldowns?: __local.BaseCommand<initialized>['cooldowns'];

    /** If true, the user must provide a value to this option. This is also enforced for prefix commands.*/
    NonNullable?: boolean;

    /**
     * Only existent for {@link commandOptions.type} `SubcommandGroup` and `Subcommand`.
     *
     * Makes the subcommand also work in direct messages.*/
    dmPermission?: boolean;

    /** Like choices, but not enforced unless {@link commandOptions.strictAutocomplete} is enabled.*/
    autocompleteOptions?: string | __local.autocompleteOptions[] | ((this: Discord.AutocompleteInteraction) => __local.autocompleteOptions[] | Promise<__local.autocompleteOptions>);

    /**
     * Return an error message to the user, if their input is not included in {@link commandOptions.autocompleteOptions}.
     * Note that this happens for Messages as well.*/
    strictAutocomplete?: boolean;

    options?: commandOptions<initialized>[];

    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  } & (initialized extends true ? {
    nameLocalizations?: __local.BaseCommand<true>['nameLocalizations'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description}*/
    description: __local.BaseCommand<true>['description'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description}*/
    descriptionLocalizations?: __local.BaseCommand<true>['descriptionLocalizations'];

    type: typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25.*/
    choices?: {
      name: string;
      nameLocalizations?: __local.BaseCommand<true>['nameLocalizations'];
      value: string | number;
    }[];
    autocomplete?: boolean;
    channelTypes?: (keyof typeof Discord.ChannelType)[];
  } : {
    type: keyof typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25.*/
    choices?: (string | number | {
      name: string;
      nameLocalizations?: __local.BaseCommand<true>['nameLocalizations'];
      value: string | number;
    })[];

    channelTypes?: (typeof Discord.ChannelType)[];
  });

  // #endregion

  type bBoundFunction<OF extends GenericFunction, T extends GenericFunction = OF> = T & {
    /** The original, unbound function */
    __targetFunction__: OF;

    /** The context to which the function is bound */
    __boundThis__: ThisParameterType<T>;

    /** The arguments to which the function is bound */
    __boundArgs__: Parameters<T> ;
  };

  // #region discord.js globals
  type Client<Ready extends boolean = true> = Discord.Client<Ready>;
  type Message<inGuild extends boolean = boolean> = Discord.Message<inGuild>;
  type Interaction<inGuild extends boolean = boolean> = inGuild extends true
    ? GuildInteraction : GuildInteraction | DMInteraction;

  // @ts-expect-error // inGuild needs to be overwritten otherwise typeguarding doesn't work.
  interface PartialGuildMessage extends Discord.Partialize<Message<true>, 'type' | 'system' | 'pinned' | 'tts', 'content' | 'cleanContent' | 'author' | 'user'> {
    inGuild(): this is PartialMessage<true>;
  }

  type PartialMessage<inGuild extends boolean = boolean> = inGuild extends true ? PartialGuildMessage : Discord.PartialMessage;

  // used to not get `any` on Message property when the object is Message | Interaction
  type OptionalInteractionProperties<inGuild extends boolean = boolean> = Partial<Interaction<inGuild>>;
  type OptionalMessageProperties<inGuild extends boolean = boolean> = Partial<Message<inGuild>>;

  /** interface for an interaction in a guild.*/
  // @ts-expect-error not important due to this being like a type
  interface GuildInteraction extends Discord.ChatInputCommandInteraction<'cached'>, OptionalMessageProperties<true> {
  }

  /** interface for an interaction in a direct message.*/
  // @ts-expect-error not important due to this being like a type
  interface DMInteraction extends Discord.ChatInputCommandInteraction<undefined>, OptionalMessageProperties<false> {
    inGuild(): false;
    inRawGuild(): false;
    inCachedGuild(): false;
    guild: null;
    guildId: null;
    guildLocale: null;
    commandGuildId: null;
    member: null;
    memberPermissions: null;
  }

  // #endregion
}

// #endregion

declare module 'discord-api-types/v10' {
  // @ts-expect-error 2300 // overwriting Snowflake
  export type Snowflake = Discord.Snowflake;
}

// #region discord.js
declare module 'discord.js' {
  // @ts-expect-error 2300 // overwriting Snowflake
  type Snowflake = `${number}`;

  interface Client<Ready> {
    prefixCommands: Discord.Collection<command['name'], command<'prefix', boolean, Ready>>;
    slashCommands: Discord.Collection<command['name'], command<'slash', boolean, Ready>>;
    backupSystem?: BackupSystem.BackupSystem;
    giveawaysManager?: GiveawaysManager;

    /** `undefined` if `this.botType == 'dev'`*/
    webServer?: WebServer;
    cooldowns: Map<string, Record<string, Map<string, number>>>;
    db: DB;
    i18n: I18nProvider;
    settings: Database['botSettings'];
    defaultSettings: Database['botSettings']['defaultGuild'];
    botType: __local.Env['environment'];
    keys: __local.Env['keys'];

    /** The config from {@link ./config.json}.*/
    config: __local.Config;
    loadEnvAndDB(this: Omit<Client<Ready>, 'db'>): Promise<void>;

    /** A promise that resolves to a fetched discord application once {@link https://discord.js.org/docs/packages/discord.js/14.14.1/Client:Class#ready Client#ready} was emitted.*/
    awaitReady(this: Client<Ready>): Promise<Application>;
  }

  interface Message {

    /**
     * The original content of the message. This is a custom property set in 'prototypeRegisterer.js'.
     *
     * This property requires the GatewayIntentBits.MessageContent privileged intent
     * for guild messages that do not mention the client.*/
    originalContent: string | null;

    /** The arguments of the message. It slices out the prefix and splits the message content on spaces. This is a custom property set in 'prototypeRegisterer.js'.*/
    args: string[] | null;

    /** The first word of the {@link Message.originalContent original content}. `null` if the content is empty. This is a custom property set in 'prototypeRegisterer.js'.*/
    commandName: string | null;

    /** Alias for {@link Message.author}*/
    user: Message['author'];

    /** This does not exist on Messages and is only for better typing of {@link command} here */
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- valid use case, as this property does not really exist*/
    options: void;


    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     * @param deleteTime Number in Milliseconds*/
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
  }

  interface BaseInteraction {

    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     * @param deleteTime Number in Milliseconds*/
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
     * ```*/
    get focused(): AutocompleteFocusedOption;
  }

  interface User {

    /**
     * ```js
     * this.client.db.get('userSettings', this.id) ?? {}
     * ```*/
    get db(): NonNullable<Database['userSettings'][Snowflake]>;

    /**
     * ```js
     * return this.client.db.update('userSettings', `${this.id}.${key}`, value);
     * ```*/
    updateDB<FDB extends __local.FlattenedUserSettings, K extends keyof FDB & string>(this: User, key: K, value: FDB[K]): Promise<NonNullable<Database['userSettings']>>;

    customName: string;
    customTag: string;
  }

  interface GuildMember {

    /** Searches the guildSettings DB recursively for all data of this member across all guilds.*/
    get db(): Record<string, unknown> | undefined;
    customName: string;
    customTag: string;
  }

  interface Guild {

    /**
     * ```js
     * this.client.db.get('guildSettings', this.id) ?? {}
     * ```*/
    get db(): NonNullable<Database['guildSettings'][Snowflake]>;

    /**
     * ```js
     * return this.client.db.update('guildSettings', `${this.id}.${key}`, value);
     * ```*/
    updateDB<FDB extends __local.FlattenedGuildSettings, K extends keyof FDB>(this: Guild, key: K, value: FDB[K]): Promise<Database['guildSettings']>;
    updateDB(this: Guild, key: null, value: NonNullable<Database['guildSettings'][Snowflake]>): Promise<Database['guildSettings']>;

    localeCode: string;
  }
}

// #endregion

// @ts-expect-error // keeping this here for documentation reasons, even tho it doesn't do anything sadly
declare module 'discord-tictactoe' {
  class TicTacToe {
    playAgain(interaction: Discord.ChatInputCommandInteraction): Promise<void>;
  }

  interface GameBoardButtonBuilder {

    /** Overwrite to make empty spaces look empty by using a zero width space.*/
    createButton(row: number, col: number): Discord.ButtonBuilder;
  }
}

// #region mongoose-db
declare module '@mephisto5558/mongoose-db' {
  interface NoCacheDB {
    /**
     * generates required database entries from {@link ./Templates/db_collections.json}.
     * @param overwrite overwrite existing collection, default: `false`*/
    generate(overwrite?: boolean): Promise<void>;

    get<DB extends keyof Database>(db: DB): Promise<Database[DB]>;
    get<DB extends keyof Database, K extends keyof DBStructure.FlattenedDatabase[DB]>(db: DB, key: K): Promise<DBStructure.FlattenedDatabase[DB][K]>;

    update<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, value: FDB[K]): Promise<Database[DB]>;
    set<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB]>(db: DB, value: FDB[keyof FDB], overwrite?: boolean): Promise<Database[DB]>;
    delete<DB extends keyof Database>(db: DB, key?: keyof DBStructure.FlattenedDatabase[DB]): Promise<boolean>;
    push<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, ...value: FDB[K][]): Promise<Database[DB]>;
    pushToSet<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, ...value: FDB[K][]): Promise<Database[DB]>;
  }

  /* eslint-disable @typescript-eslint/no-shadow -- I can't think of a better name */
  // @ts-expect-error 2300 // overwriting the class so ofc it is declared twice
  interface DB extends NoCacheDB {
    get(): undefined;
    get<DB extends keyof Database>(db: DB): Database[DB];
    get<DB extends keyof Database, K extends keyof DBStructure.FlattenedDatabase[DB]>(db: DB, key: K): DBStructure.FlattenedDatabase[DB][K];

    update<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, value: FDB[K]): Promise<Database[DB]>;
    set<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB]>(db: DB, value: FDB[keyof FDB], overwrite?: boolean): Promise<Database[DB]>;
    delete<DB extends keyof Database>(db: DB, key?: keyof DBStructure.FlattenedDatabase[DB]): Promise<boolean>;
    push<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, ...value: FDB[K][]): Promise<Database[DB]>;
    pushToSet<DB extends keyof Database, FDB extends DBStructure.FlattenedDatabase[DB], K extends keyof FDB>(db: DB, key: K, ...value: FDB[K][]): Promise<Database[DB]>;

    /* eslint-enable @typescript-eslint/no-shadow */
  }
}

// #endregion

declare module 'wikijs' {
  // intentional. `Page` in wikijs is defined as something that is not correct. All `Page`es are `RawPages` in code
  /* eslint-disable-next-line @typescript-eslint/no-empty-object-type */ // @ts-expect-error unable to import it
  interface Page extends RawPage {}
}