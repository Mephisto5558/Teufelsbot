import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type BackupSystem from './Utils/backupSystem';
import type GiveawayManagerWithOwnDatabase from './Utils/giveawaysManager';

declare global {
  const sleep: (ms: number) => Promise<void>;
  /**@returns Array of filenames*/
  const getDirectories: (path: string) => Promise<string[]>;

  const log: {
    (...str: any[]): typeof log;
    error: (...str: any[]) => typeof log;
    debug: (...str: any[]) => typeof log;
    setType: (type: string) => typeof log;
    _log(file?: string, ...str: any[]): typeof log;
  };

  /**bBinded I18nProvider.__ function */
  type lang = {
    (key: string, replacements?: string | object): string;
  } & bBoundFunction;

  type command = {
    name: string;
    id?: string;
    type?: 1;
    description: string,
    descriptionLocalizations: Record<string, string>;
    category: string;
    aliases?: { prefix?: string[], slash?: string[]; };
    permissions?: { client?: Discord.PermissionFlags[], user?: Discord.PermissionFlags[]; };
    cooldowns?: { guild?: number, user?: number; };
    slashCommand: boolean;
    prefixCommand: boolean;
    dmPermission?: boolean;
    beta?: boolean;
    disabled?: boolean;
    disabledReason?: string;
    noDefer?: boolean;
    ephemeralDefer?: boolean;
    aliasOf?: string;
    options?: commandOptions[];
    filePath: string;

    run: (this: Interaction | Message, lang: lang, client: Discord.Client) => Promise<any>;
  };

  type commandOptions = {
    name: string;
    type: Discord.ApplicationCommandOptionType;
    required?: boolean;
    choices?: (string | number)[];
    options?: commandOptions[];
    autocompleteOptions?: string | Iterable<string | number | { name: string, value: string; }> | ((this: Discord.AutocompleteInteraction) => Iterable<string | number | { name: string, value: string; }>);
    autocomplete?: boolean;
    strictAutocomplete?: boolean;
    channelTypes?: Discord.ChannelType[];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  };


  interface Array<T> {
    random(): T;
  }

  interface Number {
    limit(options?: { min?: number; max?: number; }): number;
  }

  interface Object {
    fMerge(obj: object, mode?: 'overwrite' | 'push', output?: object): object;
    filterEmpty(): object;
  }

  interface Function {
    bBind(thisArg: any, ...args: any[]): bBoundFunction;
  }

  class bBoundFunction extends Function {
    __targetFunction__: Function;
    __boundThis__: this;
    __boundArgs__: any[];
  }

  class DB {
    generate: (overwrite?: boolean) => Promise<void>;
  }

  type Client = Discord.Client;
  type Message = Discord.Message;
  type GuildMessage = Discord.Message<true>;
  type DMMessage = Discord.Message<false>;
  type AutocompleteInteraction = Discord.AutocompleteInteraction;

  interface GuildInteraction extends Discord.ChatInputCommandInteraction {
    inGuild(): true;
    guild: Discord.Guild;
    guildId: string;
    guildLocale: Discord.Locale;
    commandGuildId: Discord.Snowflake;
    member: Discord.GuildMember;
    memberPermissions: Readonly<Discord.PermissionsBitField>;
  }
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
    cooldowns: Map<string, object>;
    db: DB;
    i18n: I18nProvider;
    settings: object;
    defaultSettings: object;
    botType: string;
    awaitReady(): Promise<Discord.Application>;
  }

  interface Message {
    /**
     * The original content of the message. This is a custom property set in 'prototypeRegisterer.js'.
     * <info>This property requires the GatewayIntentBits.MessageContent privileged intent
     * in a guild for messages that do not mention the client.</info>
     */
    originalContent: string | null;

    /**
     * The arguments of the message. It slices out the prefix and splits by spaces. This is a custom property set in 'prototypeRegisterer.js'.
     */
    args: string[] | null;

    /**
     * The first word of the original message content. `null` if no prefix has been found. This is a custom property set in 'prototypeRegisterer.js'.
     */
    commandName: string | null;

    user: User;

    /**
     * @param deleteTime Number in Milliseconds
     */
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false; }
    ): Promise<Message>;

    runMessages(): this;
  }

  interface BaseInteraction {
    /**@param deleteTime Number in milliseconds*/
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false; }
    ): Promise<Message>;
  }

  interface AutocompleteInteraction {
    focused: AutocompleteFocusedOption;
  }

  interface User {
    db: object | null;
    customName: string;
    customTag: string;
  }

  interface GuildMember {
    db: any;
    customName: string;
    customTag: string;
  }

  interface Guild {
    db: object;
    localeCode: string;
  }
}

declare module 'discord-tictactoe' {
  interface TicTacToe {
    playAgain: (interaction: Discord.ChatInputCommandInteraction) => Promise<void>;
  }

  interface GameBoardButtonBuilder {
    createButton(row: number, col: number): Discord.ButtonBuilder;
  }
}
