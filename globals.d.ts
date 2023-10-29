import type { Message } from 'discord.js';
import type Discord from 'discord.js';
import type DB from '@mephisto5558/mongoose-db';
import type BackupSystem from './Utils/backupSystem';
import type Log from './Utils/prototypeRegisterer/Log';

declare global {
  const sleep: (ms: number) => Promise<void>;
  /**@returns Array of filenames*/
  const getDirectories: (path: string) => Promise<string[]>;

  const log: {
    (...str: any[]): Log;
    error: (...str: any[]) => Log;
    debug: (...str: any[]) => Log;
    setType: (type: string) => Log;
    #log(file?: string, ...str: any[]): Log;
  };

  /**bBinded I18nProvider.__ function */
  type lang = {
    (key: string, replacements?: string|object): string
  } & bBoundFunction

  interface Array<T> {
    random(): T;
  }

  interface number {
    limit(options?: { min?: number; max?: number }): number;
  }

  interface object {
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
  };

  class DB {
    generate: (overwrite?: boolean) => Promise<void>
  }

  type Message = Discord.Message
  type GuildMessage = Discord.Message<true>;
  type DMMessage = Discord.Message<false>;

  interface GuildInteraction extends Discord.ChatInputCommandInteraction {
    public inGuild(): true;
    public guild: Discord.Guild;
    public guildId: string;
    public guildLocale: Discord.Locale;
    public commandGuildId: Discord.Snowflake;
    public member: Discord.GuildMember;
    public memberPermissions: Readonly<Discord.PermissionsBitField>
  }
  interface DMInteraction extends Discord.ChatInputCommandInteraction {
    public inGuild(): false;
    public inRawGuild(): false;
    public inCachedGuild(): false;
    public guild: null;
    public guildId: null;
    public guildLocale: null;
    public commandGuildId: null;
    public member: null;
    public memberPermissions: null;
  }
  type Interaction = GuildInteraction|DMInteraction
}

declare module 'discord.js' {
  interface BaseClient {
    prefixCommands: Discord.Collection<string, object>;
    slashCommands: Discord.Collection<string, object>;
    backupSystem?: BackupSystem
    cooldowns: Map<string, object>;
    db: DB;
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
    originalContent: ?string;

    /**
     * The arguments of the message. It slices out the prefix and splits by spaces. This is a custom property set in 'prototypeRegisterer.js'.
     */
    args: ?string[];

    /**
     * The first word of the original message content. `null` if no prefix has been found. This is a custom property set in 'prototypeRegisterer.js'.
     */
    commandName: ?string;

    user: User;

    /**
     * @param deleteTime Number in Milliseconds
     */
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;

    runMessages(): this;
  }

  interface BaseInteraction {
    /**@param deleteTime Number in milliseconds*/
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;
  }

  interface AutocompleteInteraction {
    focused: AutocompleteFocusedOption;
  }

  interface User {
    db: object?;
    customName: string;
  }

  interface GuildMember {
    db: any;
    customName: string;
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