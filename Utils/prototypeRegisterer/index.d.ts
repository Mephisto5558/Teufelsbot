import type TicTacToe from 'discord-tictactoe';
import type { InteractionReplyOptions, InteractionResponse, MessageEditOptions, MessageMentionOptions, MessagePayload, RepliableInteraction } from 'discord.js';

export {
  Log,
  _patch,
  customReply,
  runMessages,
  playAgain
};

/* eslint-disable sonarjs/sonar-no-magic-numbers -- this is literally an enum.*/
declare enum LogLevels {
  debug = 0,
  log = 1,
  info = 2,
  warn = 3,
  error = 4
}
/* eslint-enable sonarjs/sonar-no-magic-numbers*/

declare class Log extends Function {
  /** @default logLevel='log'; logFilesDir='./Logs'*/
  constructor(logLevel?: keyof typeof LogLevels, logFileDir?: string);

  date: `${number}${number}-${number}${number}-${number}${number}${number}${number}`;
  logLevel: keyof typeof LogLevels;
  logFilesDir: string;

  debug(...str: unknown[]): this;
  log(...str: unknown[]): this;
  info(...str: unknown[]): this;
  warn(...str: unknown[]): this;
  error(...str: unknown[]): this;

  /** @default file='log'; type='Bot' */
  _log({ file, type }: { file?: keyof typeof LogLevels; type?: string }, ...str: unknown[]): this;
}

/** Modified from the default one to set additional properties and modify the message content. */
declare function _patch(
  this: Message,
  ...args: Parameters<Message['_patch']>
): void;

/**
 * Tries different methods to reply to a message or interaction. If the content is over 2000 chars, will send an attachment instead.
 * @default allowedMentions={repliedUser: false}*/
declare function customReply(
  this: RepliableInteraction | Message,
  options: string | InteractionReplyOptions | MessagePayload | MessageEditOptions,
  deleteTime?: number,
  allowedMentions?: MessageMentionOptions
): Promise<InteractionResponse | Message>;

declare function runMessages<T extends Message>(this: T): T;

declare function playAgain(
  this: TicTacToe,
  interaction: Interaction, lang: lang
): Promise<void>;