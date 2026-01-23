/** @import { customReply } from '.' */

const
  { AttachmentBuilder, BaseInteraction, DiscordAPIError, Message } = require('discord.js'),
  { messageMaxLength } = require('../constants'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json');

/**
 * @param {Error | undefined} err
 * @returns {boolean} `true` if no err is given, `false` on specific error codes
 * @throws {DiscordAPIError} if the error is not a DiscordAPIError* */
function handleError(err) {
  if (!err) return true;
  if (!(err instanceof DiscordAPIError) || err.code == DiscordAPIErrorCodes.InvalidFormBody) throw err;

  log.debug(`An error occurred while trying to send a message: ${err.toString()}`);
  return ![DiscordAPIErrorCodes.UnknownInteraction, DiscordAPIErrorCodes.InvalidWebhookTokenProvided].includes(err.code);
}

/** @type {customReply} */

module.exports = async function customReply(options, deleteTime, allowedMentions) {
  if (typeof options != 'object') options = { content: options };
  else if ('options' in options) ({ options } = options);

  options.allowedMentions ??= allowedMentions ?? { repliedUser: false };

  if (options.content && options.content.length > messageMaxLength) {
    // matches one code block, it's code, and the language (extention) it is in.
    const match = /```(?:\n?(?<ext>\w+)\n)?(?<code>(?:.|\n)+)```/.exec(options.content);

    options.files = [
      ...options.files ?? [],
      match?.[0].length == options.content.length
        ? new AttachmentBuilder(Buffer.from(match.groups.code.trim()), { name: `content.${match.groups.ext}` })
        : new AttachmentBuilder(Buffer.from(options.content), { name: 'content.txt' })
    ];

    delete options.content;
  }

  /** @type {Message | undefined} */
  let msg;
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
  else if (this instanceof Message) {
    try { msg = await (this.editable ? this.edit(options) : this.reply(options)); }
    catch (err) {
      handleError(err);
      msg = await this.channel.send(options);
    }
  }

  if (msg?.deletable && !Number.isNaN(Number.parseInt(deleteTime)))
    setTimeout(() => void msg.delete().catch(() => { /* empty */ }), deleteTime);

  return msg;
};