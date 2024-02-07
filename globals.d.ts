import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type { WebServer } from '@mephisto5558/bot-website';
import type BackupSystem from './Utils/backupSystem';
import type GiveawayManagerWithOwnDatabase from './Utils/giveawaysManager';

declare global {
  const sleep: (ms: number) => Promise<void>;

  /** Custom logging, including logfiles.*/
  const log: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (...str: any[]): typeof log;
    error: (...str: any[]) => typeof log;
    debug: (...str: any[]) => typeof log;
    setType: (type: string) => typeof log;
    _log(file?: string, ...str: any[]): typeof log;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  // https://stackoverflow.com/a/46370791/17580213
  type AllKeys<T> = T extends unknown ? keyof T : never;
  type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
  type _ExclusifyUnion<T, K extends PropertyKey> = T extends unknown ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>> : never;
  type ExclusifyUnion<T> = _ExclusifyUnion<T, AllKeys<T>>;

  /** bBinded I18nProvider.__ function*/
  type lang = bBoundFunction<I18nProvider['__'], (this: I18nProvider, key: string, replacements?: string | object) => string>;

  type cooldowns = { guild?: number; channel?: number; user?: number };
  type autocompleteOptions = string | number | { name: string; value: string };

  type BaseCommand<initialized extends boolean = boolean> = {
    /** For slash commands, must be lowercase.*/
    name: string;

    /** Numbers in milliseconds*/
    cooldowns?: cooldowns;

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
    /** Currently not used*/
    nameLocalizations?: readonly Record<string, BaseCommand<true>['name']>;

    /** Gets set automatically from language files.
     * For slash commands, can not be longer then 100 chars.*/
    description: string;

    /** Gets set automatically from language files.
     * @see {@link command.description}*/
    descriptionLocalizations: readonly Record<string, BaseCommand<true>['description']>;

    /** Gets set to the lowercase folder name the command is in.*/
    category: readonly string;

    permissions?: {
      client?: Discord.PermissionFlags[];
      user?: Discord.PermissionFlags[];
    };

    /** **Do not set manually.**
     *
     * If the command is an alias, this property will have the original name.*/
    aliasOf?: readonly BaseCommand['name'];

    /** **Do not set manually.**
     *
     * The command's full file path, used for e.g. reloading the command.*/
    filePath: readonly string;
  } : {
    permissions?: {
      client?: (keyof Discord.PermissionFlags)[];
      user?: (keyof Discord.PermissionFlags)[];
    };
  });

  type slashCommand<initialized extends boolean = false> = BaseCommand<initialized> & {
    slashCommand: true;
    aliases?: { slash?: BaseCommand['name'][] };

    /** Do not deferReply to the interaction*/
    noDefer?: boolean;

    /** Do `interaction.deferReply({ ephemeral: true })`.
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
  }: object);

  type prefixCommand<initialized extends boolean = false> = BaseCommand<initialized> & {
    prefixCommand: true;
    aliases?: { prefix?: BaseCommand['name'][] };
  };

  type command<commandType extends 'prefix' | 'slash' | 'both' = 'both', guildOnly extends boolean = true, initialized extends boolean = false> = BaseCommand<initialized>
  & (commandType extends 'slash' | 'both' ? slashCommand<initialized> : object)
  & (commandType extends 'prefix' | 'both' ? prefixCommand<initialized> : object)
  & { run: (
    this: ExclusifyUnion<commandType extends 'slash' ? Interaction<guildOnly> : commandType extends 'prefix' ? Message<guildOnly extends true ? true : boolean> : Interaction<guildOnly> | Message<guildOnly extends true ? true : boolean>>,
    lang: lang, client: Discord.Client<true>
  ) => Promise<never>; };

  type commandOptions<initialized extends boolean = boolean> = {
    name: string;
    cooldowns?: cooldowns;

    /** If true, the user must provide a value to this option.*/
    required?: boolean;

    /** Like choices, but not enforced unless {@link commandOptions.strictAutocomplete} is enabled.*/
    autocompleteOptions?: string | autocompleteOptions[] | ((this: Discord.AutocompleteInteraction) => autocompleteOptions[] | Promise<autocompleteOptions>);

    /** Return an error message to the user, if their input is not included in {@link commandOptions.autocompleteOptions}.
     * Note that this happens for Messages as well.*/
    strictAutocomplete?: boolean;

    options?: commandOptions<initialized>[];

    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  } & (initialized extends true ? {
    nameLocalizations?: BaseCommand<true>['nameLocalizations'];

    /** Gets set automatically from language files.
     * @see {@link command.description}*/
    description: BaseCommand<true>['description'];

    /** Gets set automatically from language files.
     * @see {@link command.description}*/
    descriptionLocalizations: BaseCommand<true>['descriptionLocalizations'];

    type: typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25.*/
    choices?: {
      name: string; nameLocalizations: Record<string, BaseCommand<string>>;
      value: BaseCommandOptions<true>['choices'];
    }[];
    autocomplete?: boolean;
    channelTypes?: (keyof typeof Discord.ChannelType)[];
  } : {
    type: keyof typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25.*/
    choices?: (string | number | {
      name: string; nameLocalizations: Record<string, string>;
      value: BaseCommandOptions<true>['choices'];
    })[];

    channelTypes?: (typeof Discord.ChannelType)[];
  });

  namespace NodeJS {
    interface Process {
      /** The real process uptime. This property only exists if process args include uptime=...*/
      childUptime?(): number;

      /** If `process.childUptime` exists (process args includes uptime=...), this is
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
    /** Merges two objects recursively together.
     * @param mode how to handle array entries that are in both objects.*/
    fMerge(this: object, obj: object, mode?: 'overwrite' | 'push', output?: object): object;

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

  /** interface for an interaction in a guild.*/
  interface GuildInteraction<Cached extends Discord.CacheType = Discord.CacheType> extends Discord.ChatInputCommandInteraction<Cached> {
    inGuild(): true;
    guild: Discord.Guild;
    guildId: string;
    guildLocale: Discord.Locale;
    commandGuildId: Discord.Snowflake;
    member: Discord.GuildMember;
    memberPermissions: Readonly<Discord.PermissionsBitField>;
  }

  /** interface for an interaction in a direct message.*/
  interface DMInteraction<Cached extends Discord.CacheType = Discord.CacheType> extends Discord.ChatInputCommandInteraction<Cached> {
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

  type Interaction<inGuild extends boolean = boolean, Cached extends Discord.CacheType = Discord.CacheType> = inGuild extends true ? GuildInteraction<Cached> : GuildInteraction<Cached> | DMInteraction<Cached>;
}

declare module 'discord.js' {
  interface Client<Ready> {
    prefixCommands: Discord.Collection<string, command<'prefix', boolean, Ready>>;
    slashCommands: Discord.Collection<string, command<'slash', boolean, Ready>>;
    backupSystem?: BackupSystem;
    giveawaysManager?: GiveawayManagerWithOwnDatabase;
    webServer: WebServer;
    cooldowns: Map<string, { [key: string]: Map<string, number> }>;
    db: DB;
    i18n: I18nProvider;
    settings: object;
    defaultSettings: object;
    botType: string;
    keys: Record<string, string>;
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
     * this.client.db?.get('userSettings')?.[this.id] ?? {}
     * ```*/
    get db(): object;
    customName: string;
    customTag: string;
  }

  interface GuildMember {
    /** Searches the guildSettings DB recursively for all data of this member across all guilds.*/
    get db(): object | undefined;
    customName: string;
    customTag: string;
  }

  interface Guild {
    /**
     * ```js
     * this.client.db?.get('guildSettings')?.[this.id] ?? {}
     * ```*/
    get db(): unknown;
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
  }
}
