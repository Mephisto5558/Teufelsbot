import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type { WebServer as WebServerClass } from '@mephisto5558/bot-website';
import type express from 'express';
import type BackupSystem from './Utils/backupSystem';
import type GiveawayManagerWithOwnDatabase from './Utils/giveawaysManager';

declare global {
  const sleep: (ms: number) => Promise<void>;
  
  /**@returns Array of filenames*/
  const getDirectories: (path: string) => Promise<string[]>;

  /**Custom logging, including logfiles.*/
  const log: {
    (...str: any[]): typeof log;
    error: (...str: any[]) => typeof log;
    debug: (...str: any[]) => typeof log;
    setType: (type: string) => typeof log;
    _log(file?: string, ...str: any[]): typeof log;
  };

  /**bBinded I18nProvider.__ function*/
  type lang = {
    (key: string, replacements?: string | object): string;
  } & bBoundFunction;

  type command = {
    /**For slash commands, must be lowercase.*/
    name: readonly string;
    /** **Do not set manually.***/
    id?: readonly Discord.Snowflake;
    /** **Do not set manually.***/
    type?: readonly 1;
    /**Gets set automatically from language files.
     * For slash commands, can not be longer then 100 chars.*/
    description: string;
    /**Gets set automatically from language files.
     * @see {@link command.description}*/
    descriptionLocalizations: Record<string, string>;
    /**Gets set to the lowercase folder name the command is in.*/
    category: readonly string;
    aliases?: { prefix?: string[], slash?: string[]; };
    permissions?: { 
      /**Can be the bigints or flag names*/
      client?: Discord.PermissionFlags[],
      /**Can be the bigints or flag names*/
      user?: Discord.PermissionFlags[];
    };
    cooldowns?: { guild?: number, user?: number; };
    slashCommand: boolean;
    prefixCommand: boolean;
    /**Makes the command also work in direct messages.*/
    dmPermission?: boolean;
    /**Beta commands are the only commands that get loaded when `client.env == 'dev'`.*/
    beta?: boolean;
    /**This command will not be loaded*/
    disabled?: boolean;
    /**If enabled in {@link ./config.json} and set here, will be shown to the user when they try to run the command.*/
    disabledReason?: string;
    /**Do not deferReply to the interaction*/
    noDefer?: boolean;
    /**Do `interaction.deferReply({ ephemeral: true })`.
     * 
     * Gets ignored if {@link command.noDefer} is `true`.  */
    ephemeralDefer?: boolean;
    /** **Do not set manually.**
     * 
     * If the command is an alias, this property will have the original name.*/
    aliasOf?: readonly string;
    /**Slash command options*/
    options?: commandOptions[];
    /** **Do not set manually.**
     * 
     * The command's file path, used for e.g. reloading the command.*/
    filePath: string;

    run: (this: Interaction | Message, lang: lang, client: Discord.Client) => Promise<any>;
  };

  type commandOptions = {
    name: string;
    /**Gets set automatically from language files.
    * @see {@link command.description}*/
    description: string;
    /**Gets set automatically from language files.
    * @see {@link command.description}*/
    descriptionLocalizations: Record<string, string>;
    /**Can be the integer or type name*/
    type: Discord.ApplicationCommandOptionType;
    /**If true, the user must provide a value to this option.*/
    required?: boolean;
    /**Choices the user must choose from. Can not be more then 25.*/
    choices?: (string | number)[];
    /**Sub-options, e.g command->subcommand group->subcommand*/
    options?: commandOptions[];
    /**Like choices, but not enforced unless {@link commandOptions.strictAutocomplete} is enabled.*/
    autocompleteOptions?: string | Iterable<string | number | { name: string, value: string; }> | ((this: Discord.AutocompleteInteraction) => Iterable<string | number | { name: string, value: string; }>);
    /**Automatically set to `true` if {@link commandOptions.autocompleteOptions} are set.*/
    autocomplete?: readonly boolean;
    /**Return an error message to the user, if their input is not included in {@link commandOptions.autocompleteOptions}.
     * Note that this happens for Messages as well.*/
    strictAutocomplete?: boolean;
    /**Can be the integer or type name.*/
    channelTypes?: Discord.ChannelType[];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  };

  type WebServer = WebServerClass;

  type Req = express.Request;
  type Res = express.Response;
  type NextFunc = express.NextFunction;

  namespace NodeJS {
    interface Process {
      /**The real process uptime. This property only exists if process args include uptime=...*/
      childUptime?(): number;

      /**If `process.childUptime` exists (process args includes uptime=...), this is
       * 
       * `process.childUptime() + parentUptime`
       * 
       * Otherwise it is the default `process.uptime()`*/
      uptime(): number;
    }
  }

  interface Array<T> {
    /**Generates a cryptographically secure random number using node:crypto.*/
    random(): T;
  }

  interface Number {
    limit(options?: { min?: number; max?: number; }): number;
  }

  interface Object {
    /**Merges two objects recursively together.
     * @param mode how to handle array entries that are in both objects.*/
    fMerge(obj: object, mode?: 'overwrite' | 'push', output?: object): object;

    /**Removes `null`, `undefined`, empty arrays and empty objects recursively.*/
    filterEmpty(): object;
  }

  interface Function {
    /**A wrapper for {@link Function.prototype.bind}. @see {@link bBoundFunction}*/
    bBind(thisArg: any, ...args: any[]): bBoundFunction;
  }

  class bBoundFunction extends Function {
    /**The original, unbound function*/
    __targetFunction__: Function;
    __boundThis__: this;
    __boundArgs__: any[];
  }

  type Client = Discord.Client;
  type Message = Discord.Message;
  type GuildMessage = Discord.Message<true>;
  type DMMessage = Discord.Message<false>;
  type AutocompleteInteraction = Discord.AutocompleteInteraction;

  /**interface for an interaction in a guild.*/
  interface GuildInteraction extends Discord.ChatInputCommandInteraction {
    inGuild(): true;
    guild: Discord.Guild;
    guildId: string;
    guildLocale: Discord.Locale;
    commandGuildId: Discord.Snowflake;
    member: Discord.GuildMember;
    memberPermissions: Readonly<Discord.PermissionsBitField>;
  }

  /**interface for an interaction in a direct message.*/
  interface DMInteraction extends Discord.ChatInputCommandInteraction {
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

  type Interaction = GuildInteraction | DMInteraction;
}

declare module 'discord.js' {
  interface BaseClient {
    prefixCommands: Discord.Collection<string, command>;
    slashCommands: Discord.Collection<string, command>;
    backupSystem?: BackupSystem;
    giveawaysManager?: GiveawayManagerWithOwnDatabase;
    webServer: WebServer;
    cooldowns: Map<string, { guild?: Map<string, number>, user?: Map<string, number> }>;
    db: DB;
    i18n: I18nProvider;
    settings: object;
    defaultSettings: object;
    botType: string;
    /**A promise that resolves to a fetched discord application once {@link https://discord.js.org/docs/packages/discord.js/14.14.1/Client:Class#ready Client#ready} was emitted.*/
    awaitReady(): Promise<Discord.Application>;
  }

  interface Message {
    /**
     * The original content of the message. This is a custom property set in 'prototypeRegisterer.js'.
     * @info This property requires the GatewayIntentBits.MessageContent privileged intent
     * for guild messages that do not mention the client.*/
    originalContent: string | null;

    /**The arguments of the message. It slices out the prefix and splits the message content on spaces. This is a custom property set in 'prototypeRegisterer.js'.*/
    args: string[] | null;

    /**The first word of the {@link Message.originalContent original content}. `null` if the content is empty. This is a custom property set in 'prototypeRegisterer.js'.*/
    commandName: string | null;

    /**Alias for {@link Message.author}*/
    user: User;

    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     * @param deleteTime Number in Milliseconds*/
    customReply(
      options: string | MessagePayload | MessageEditOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false; }
    ): Promise<Message>;

    runMessages(): this;
  }

  interface BaseInteraction {
    /**
     * A general reply function for messages and interactions. Will edit the message/interaction if possible, else reply to it,
     * and if that also doesn't work, send the message without repling to a specific message/interaction.
     * @param deleteTime Number in Milliseconds*/
    customReply(
      options: string | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false; }
    ): Promise<Message>;
  }

  interface AutocompleteInteraction {
    /**```js
     * this.options.getFocused(true)
     * ```*/
    get focused(): AutocompleteFocusedOption;
  }

  interface User {
    /**```js
     * this.client.db?.get('userSettings')?.[this.id] ?? {}
     * ```*/
    get db(): object;
    customName: string;
    customTag: string;
  }

  interface GuildMember {
    /**Searches the guildSettings DB recursively for all data of this member across all guilds.*/
    get db(): object | undefined;
    customName: string;
    customTag: string;
  }

  interface Guild {
    /**```js
     * this.client.db?.get('guildSettings')?.[this.id] ?? {}
     * ```*/
    get db(): any;
    localeCode: string;
  }
}

declare module 'discord-tictactoe' {
  interface TicTacToe {
    playAgain(interaction: Discord.ChatInputCommandInteraction): Promise<void>;
  }

  interface GameBoardButtonBuilder {
    /**Overwrite to make empty spaces look empty by using a zero width space.*/
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