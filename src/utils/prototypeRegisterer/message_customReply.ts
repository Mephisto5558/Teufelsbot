import { AttachmentBuilder, BaseInteraction, DiscordAPIError } from 'discord.js';
import { isMessage } from '@mephisto5558/command';
import { messageMaxLength } from '../constants.ts';
import DiscordAPIErrorCodes from '../DiscordAPIErrorCodes.json' with { type: 'json' };
import type { GuildTextBasedChannel, InteractionResponse, MessageMentionOptions, RepliableInteraction } from 'discord.js';

/**
 * @returns 'true' if no err is given, `false` on specific error codes
 * @throws {DiscordAPIError} if the error is not a DiscordAPIError* */
function handleError(err: Error | undefined): boolean {
  if (!err) return true;
  if (!(err instanceof DiscordAPIError) || err.code == DiscordAPIErrorCodes.InvalidFormBody) throw err;

  log.debug(`An error occurred while trying to send a message: ${err.toString()}`);
  return ![DiscordAPIErrorCodes.UnknownInteraction, DiscordAPIErrorCodes.InvalidWebhookTokenProvided].includes(err.code);
}

/**
 * Tries different methods to reply to a message or interaction. If the content is over 2000 chars, will send an attachment instead.
 * @default allowedMentions = `{ repliedUser: false }` */
export default async function customReply(
  this: RepliableInteraction | Message,
  options: string | Parameters<
    RepliableInteraction['reply' | 'editReply' | 'followUp'] | Message['edit' | 'reply'] | GuildTextBasedChannel['send']
  >['0'],
  deleteTime?: number,
  allowedMentions?: MessageMentionOptions
): Promise<InteractionResponse | Message> {
  if (typeof options != 'object') options = { content: options };
  else if ('options' in options) ({ options } = options);

  options.allowedMentions ??= allowedMentions ?? { repliedUser: false };

  if (options.content && options.content.length > messageMaxLength) {
    // matches one code block, it's code, and the language (extention) it is in.
    const match = /```(?:\n?(?<ext>\w+)\n)?(?<code>(?:.|\n)+)```/.exec(options.content);

    options.files = [
      ...options.files ?? [],
      match?.[0].length == options.content.length && match.groups?.code
        ? new AttachmentBuilder(Buffer.from(match.groups.code.trim()), { name: `content.${match.groups.ext}` })
        : new AttachmentBuilder(Buffer.from(options.content), { name: 'content.txt' })
    ];

    delete options.content;
  }

  let msg: Message | undefined;
  if (this instanceof BaseInteraction) {
    try { msg = await (this.replied || this.deferred ? this.editReply(options) : this.reply(options)); }
    catch (err) {
      const interactionHandleable = handleError(err);
      try { msg = await (interactionHandleable ? this.followUp(options) : this.channel.send(options)); }
      catch (err) {
        handleError(err);
        if (!interactionHandleable) msg = await this.channel.send(options);
      }
    }
  }
  else if (isMessage(this)) {
    try { msg = await (this.editable ? this.edit(options) : this.reply(options)); }
    catch (err) {
      handleError(err);
      msg = await this.channel.send(options);
    }
  }

  if (msg?.deletable && deleteTime != undefined)
    setTimeout(() => void msg.delete().catch(() => { /* empty */ }), deleteTime);

  return msg;
}