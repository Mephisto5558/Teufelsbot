import type {
  APIAllowedMentions,
  Collection,
  Message,
  ChatInputCommandInteraction,
  ButtonBuilder,
} from "discord.js";

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

  interface Array<T> {
    random(): T;
  }

  interface Number {
    limit(options?: { min?: number; max?: number }): number;
  }

  interface Object {
    fMerge(obj: object, mode?: "overwrite" | "push", output?: object): object;
    filterEmpty(): object;
  }

  interface Function {
    bBind(thisArg: any, ...args: any[]): Function;
  }
}

declare module "discord.js" {
  interface BaseClient {
    prefixCommands: Collection<string, obj>;
    slashCommands: Collection<string, obj>;
    cooldowns: Map<string, obj>;
    settings: object;
    defaultSettings: object;
    awaitReady(): Promise<Application>;
  }

  interface Message {
    /**
     * The original content of the message. This is a custom property set in "prototypeRegisterer.js".
     * <info>This property requires the GatewayIntentBits.MessageContent privileged intent
     * in a guild for messages that do not mention the client.</info>
     */
    originalContent: ?string;

    /**
     * The arguments of the message. It slices out the prefix and splits by spaces. This is a custom property set in "prototypeRegisterer.js".
     */
    args: ?string[];

    /**
     * The first word of the original message content. `null` if no prefix has been found. This is a custom property set in "prototypeRegisterer.js".
     */
    commandName: ?string;

    user: User;

    /**
     * @param deleteTime Number in Milliseconds
     */
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: Number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;

    runMessages(): this;
  }

  interface BaseInteraction {
    /**
     * @param deleteTime Number in Milliseconds
     */
    customReply(
      options: string | MessageEditOptions | MessagePayload | InteractionReplyOptions,
      deleteTime?: Number,
      allowedMentions?: MessageMentionOptions | { repliedUser: false }
    ): Promise<Message>;
  }

  interface AutocompleteInteraction {
    focused: AutocompleteFocusedOption;
  }

  interface User {
    db: any;
    customName: string;
  }

  interface GuildMember {
    db: any;
    customName: string;
  }

  interface Guild {
    db: any;
    localeCode: string;
  }
}

declare module "discord-tictactoe" {
  interface TicTacToe {
    playAgain: (interaction: ChatInputCommandInteraction) => Promise<void>;
  }

  interface GameBoardButtonBuilder {
    createButton(row: number, col: number): ButtonBuilder;
  }
}
