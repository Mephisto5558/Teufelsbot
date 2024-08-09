import type TicTacToe from 'discord-tictactoe';
import type { InteractionReplyOptions, InteractionResponse, MessageEditOptions, MessageMentionOptions, MessagePayload, RepliableInteraction, VoiceState } from 'discord.js';

export {
  Log,
  _patch,
  customReply,
  runMessages,
  playAgain,
  utils
};

declare class Log extends Function {
  constructor();

  log(...str: unknown[]): this;
  warn(...str: unknown[]): this;
  error(...str: unknown[]): this;
  debug(...str: unknown[]): this;

  /** @default file='log'; type='Bot' */
  _log({ file, type }: { file?: string; type?: string }, ...str: unknown[]): this;
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

declare namespace utils {
  function removeAfkStatus(this: Message | VoiceState): Promise<Message | undefined>;
}