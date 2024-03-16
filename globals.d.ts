import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type { WebServer } from '@mephisto5558/bot-website';
import type Database from './database';
import type BackupSystem from './Utils/backupSystem';
import type GiveawayManagerWithOwnDatabase from './Utils/giveawaysManager';

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
    nameLocalizations?: readonly Record<string, BaseCommand<true>['name']>;

    /**
     * Gets set automatically from language files.
     * For slash commands, can not be longer then 100 chars.*/
    description: string;

    /**
     * Gets set automatically from language files.
     * @see {@link command.description}*/
    descriptionLocalizations: readonly Record<string, BaseCommand<true>['description']>;

    /** Gets set to the lowercase folder name the command is in.*/
    category: readonly string;

    permissions?: {
      client?: Discord.PermissionFlags[];
      user?: Discord.PermissionFlags[];
    };

    /**
     * **Do not set manually.**
     *
     * If the command is an alias, this property will have the original name.*/
    aliasOf?: readonly BaseCommand['name'];

    /**
     * **Do not set manually.**
     *
     * The command's full file path, used for e.g. reloading the command.*/
    filePath: readonly string;
  } : {

    /** @deprecated Change the filename to the desired name instead.*/
    name?: string;

    /** @deprecated Use language files instead.*/
    description?: string;

    /** @deprecated Change the directory name to the desired category instead.*/
    category?: string;

    permissions?: {
      client?: (keyof Discord.PermissionFlags)[];
      user?: (keyof Discord.PermissionFlags)[];
    };
  });

  interface Config {
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
}


declare global {
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

    /** Generates a cryptographically secure random number using node:crypto.*/
    random(this: T[]): T;
  }

  interface Number {
    limit(options?: { min?: number; max?: number }): number;
  }

  interface Object {
    /** Removes `null`, `undefined`, empty arrays and empty objects recursively.*/
    filterEmpty(this: object): object;
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
     * @param thisArg The object to be used as the this object.
     * @param args Arguments to bind to the parameters of the function.
     */
    bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
    bind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): (...args: AX[]) => R;

    /** A wrapper for {@link Function.prototype.bind}. @see {@link bBoundFunction}*/
    bBind<T>(this: T, thisArg: ThisParameterType<T>): bBoundFunction<T>;
    bBind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): bBoundFunction<(...args: AX[]) => R>;
  }

  const sleep: (ms: number) => Promise<void>;

  /** Custom logging, including logfiles.*/
  const log: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (...str: any[]): typeof log;
    log(): (...str: any[]) => typeof log;
    warn(): (...str: any[]) => typeof log;
    error: (...str: any[]) => typeof log;
    debug: (...str: any[]) => typeof log;
    _log({ file, type }?: { file?: string; type?: string }, ...str: any[]): typeof log;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  /** bBinded I18nProvider.__ function*/
  type lang = bBoundFunction<I18nProvider['__'], (this: I18nProvider, key: string, replacements?: string | object) => string>;

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
    id: readonly Discord.Snowflake;

    /** **Do not set manually.***/
    type: readonly Discord.ApplicationCommandType.ChatInput;

    defaultMemberPermissions: readonly Discord.PermissionsBitField;

    dmPermission: boolean;
  } : object);

  type prefixCommand<initialized extends boolean = false> = __local.BaseCommand<initialized> & {
    prefixCommand: true;
    aliases?: { prefix?: __local.BaseCommand['name'][] };
  };

  type command<commandType extends 'prefix' | 'slash' | 'both' = 'both', guildOnly extends boolean = true, initialized extends boolean = false> = __local.BaseCommand<initialized>
    & (commandType extends 'slash' | 'both' ? slashCommand<initialized> : object)
    & (commandType extends 'prefix' | 'both' ? prefixCommand<initialized> : object)
    & { run: (
      this: commandType extends 'slash' ? Interaction<guildOnly> : commandType extends 'prefix' ? Message<guildOnly> : Interaction<guildOnly> | Message<guildOnly>,
      lang: lang, client: Discord.Client<true>
    ) => Promise<never>; };

  type commandOptions<initialized extends boolean = boolean> = {
    name: string;

    /** Numbers in milliseconds*/
    cooldowns?: __local.BaseCommand<initialized>['cooldowns'];

    /** If true, the user must provide a value to this option. This is also enforced for prefix commands.*/
    required?: boolean;

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
    descriptionLocalizations: __local.BaseCommand<true>['descriptionLocalizations'];

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

  type bBoundFunction<OF, T extends CallableFunction> = T & {

    /** The original, unbound function */
    __targetFunction__: OF;

    /** The context to which the function is bound */
    __boundThis__: ThisParameterType<T>;

    /** The arguments to which the function is bound */
    __boundArgs__: unknown[];
  };

  type Client<Ready extends boolean = true> = Discord.Client<Ready>;
  type Message<inGuild extends boolean = boolean> = Discord.Message<inGuild>;
  type Interaction<inGuild extends boolean = boolean, Cached extends Discord.CacheType = Discord.CacheType> = inGuild extends true
    ? GuildInteraction<Cached> : GuildInteraction<Cached> | DMInteraction<Cached>;

  type OptionalInteractionProperties<inGuild extends boolean = boolean> = Partial<Interaction<inGuild>>;
  type OptionalMessageProperties<inGuild extends boolean = boolean> = Partial<Message<inGuild>>;

  /** interface for an interaction in a guild.*/
  interface GuildInteraction<Cached extends Discord.CacheType = Discord.CacheType> extends Discord.ChatInputCommandInteraction<Cached>, OptionalMessageProperties<true> {
    inGuild(): true;
    guild: Discord.Guild;
    guildId: string;
    guildLocale: Discord.Locale;
    commandGuildId: Discord.Snowflake;
    member: Discord.GuildMember;
    memberPermissions: Readonly<Discord.PermissionsBitField>;
  }

  /** interface for an interaction in a direct message.*/
  interface DMInteraction<Cached extends Discord.CacheType = Discord.CacheType> extends Discord.ChatInputCommandInteraction<Cached>, OptionalMessageProperties<false> {
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
}

declare module 'discord.js' {
  interface Client<Ready> {
    prefixCommands: Discord.Collection<command['name'], command<'prefix', boolean, Ready>>;
    slashCommands: Discord.Collection<command['name'], command<'slash', boolean, Ready>>;
    backupSystem?: BackupSystem;
    giveawaysManager?: GiveawayManagerWithOwnDatabase;
    webServer: WebServer;
    cooldowns: Map<string, Record<string, Map<string, number>>>;
    db: DB;
    i18n: I18nProvider;
    settings: Database.botSettings;
    defaultSettings: Database.guildSettings['default'];
    botType: __local.Env['environment'];
    keys: __local.Env['keys'];

    /** The config from {@link ./config.json}.*/
    config: __local.Config;
    loadEnvAndDB(this: Client<Ready>): Promise<void>;

    /** A promise that resolves to a fetched discord application once {@link https://discord.js.org/docs/packages/discord.js/14.14.1/Client:Class#ready Client#ready} was emitted.*/
    awaitReady(this: Client<Ready>): Promise<Discord.Application>;
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

    runMessages(this: Message): Promise<this>;
  }

  interface BaseInteraction {

    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     * @param deleteTime Number in Milliseconds*/
    customReply<T>(
      this: T,
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
    get db(): Exclude<Database.userSettings[''], undefined>;
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
    get db(): Exclude<Database.guildSettings[''], undefined>;
    localeCode: string;
  }
}

declare module 'discord-tictactoe' {
  interface TicTacToe {
    playAgain(interaction: Discord.ChatInputCommandInteraction): Promise<void>;
  }

  interface GameBoardButtonBuilder {

    /** Overwrite to make empty spaces look empty by using a zero width space.*/
    createButton(row: number, col: number): Discord.ButtonBuilder;
  }
}

declare module '@mephisto5558/mongoose-db' {
  class DB {
    /**
     * generates required database entries from {@link ./Templates/db_collections.json}.
     * @param overwrite overwrite existing collection, default: `false`*/
    generate(overwrite?: boolean): Promise<void>;

    get(db: 'leaderboards'): Database.leaderboards;
    get(db: 'userSettings'): Database.userSettings;
    get(db: 'guildSettings'): Database.guildSettings;
    get(db: 'polls'): Database.polls;
    get(db: 'botSettings'): Database.botSettings;
    get(db: 'backups'): Database.backups;
    get(db: 'website'): Database.website;
  }
}