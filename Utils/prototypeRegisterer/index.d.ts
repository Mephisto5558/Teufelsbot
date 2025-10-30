import type {
  CommandInteractionOption, GuildTextBasedChannel, InteractionResponse, MessageMentionOptions, RepliableInteraction, SendableChannels
} from 'discord.js';
import type TicTacToe from 'discord-tictactoe';

export {
  LogClass as Log,
  type Log as LogInterface,
  _patch,
  customReply,
  runMessages,
  sendChallengeMention,
  playAgain
};

declare enum LogLevels {
  debug = 0,
  log = 1,
  info = 2,
  warn = 3,
  error = 4
}

/* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
interface Log<FILE_LOGGING_ENABLED extends boolean = true> extends CallableFunction {
  date: `${number}${number}-${number}${number}-${number}${number}${number}${number}`;
  logLevel: keyof typeof LogLevels;
  logFilesDir: FILE_LOGGING_ENABLED extends true ? string : never;

  (...str: unknown[]): this;
  debug(...str: unknown[]): this;
  log(...str: unknown[]): this;
  info(...str: unknown[]): this;
  warn(...str: unknown[]): this;
  error(...str: unknown[]): this;

  _logToConsole({ file, type, prefix }?: { file?: keyof typeof LogLevels; type?: string; prefix?: string }, ...args: unknown[]): this;
  _logToFile({ file, type, prefix }?: { file?: keyof typeof LogLevels | string & {}; type?: string; prefix?: string }, ...args: unknown[]): this;

  /** @default file='log'; type='Bot'; prefix='<ISODate> <type> | ' */
  _log({ file, type, prefix }?: { file?: keyof typeof LogLevels; type?: string; prefix?: string }, ...args: unknown[]): this;
}

declare const LogClass: new<
  DIR extends string | false = string
>(logLevel?: keyof typeof LogLevels, logFileDir?: DIR) => Log<DIR extends boolean ? false : true>;

/** Modified from the default one to set additional properties and modify the message content. */
declare function _patch(
  this: Message,
  ...args: Parameters<Message['_patch']>
): void;

/**
 * Tries different methods to reply to a message or interaction. If the content is over 2000 chars, will send an attachment instead.
 * @default allowedMentions={repliedUser: false} */
declare function customReply(
  this: (RepliableInteraction | Message) & { channel: SendableChannels },

  // options: string | InteractionReplyOptions | MessagePayload | MessageEditOptions,
  options: string | Parameters<
    RepliableInteraction['reply' | 'editReply' | 'followUp'] | Message['edit' | 'reply'] | GuildTextBasedChannel['send']
  >['0'],
  deleteTime?: number,
  allowedMentions?: MessageMentionOptions
): Promise<InteractionResponse | Message>;

declare function runMessages<T extends Message<true>>(this: T): T;

declare function playAgain(
  this: TicTacToe,
  interaction: Interaction & { options: { _hoistedOptions: CommandInteractionOption[] } }, lang: lang
): Promise<void>;

/** Sends the challenge mention after waiting 10s, then waits 5s and deletes its afterwards. */
declare function sendChallengeMention(msg: Interaction, userId: Snowflake, lang: lang): Promise<void>;