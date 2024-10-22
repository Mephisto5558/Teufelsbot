const
  { AttachmentBuilder, BaseInteraction, Message, DiscordAPIError } = require('discord.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json'),
  MAX_MESSAGE_LENGTH = 2000;

/**
 * @param {Error | undefined}err
 * @returns {boolean} `true` if no err is given, `false` on specific error codes
 * @throws {DiscordAPIError}if the error is not a DiscordAPIError**/
function handleError(err) {
  if (!err) return true;
  if (!(err instanceof DiscordAPIError)) throw err;

  log.debug(`An error occurred while trying to send a message: ${err.toString()}`);
  return ![DiscordAPIErrorCodes.UnknownInteraction, DiscordAPIErrorCodes.InvalidWebhookTokenProvided].includes(err.code);
}

/** @type {import('.').customReply}*/

module.exports = async function customReply(options, deleteTime, allowedMentions) {
  let msg;

  if (typeof options != 'object') options = { content: options };
  options.allowedMentions ??= allowedMentions ?? { repliedUser: false };

  if (options.content?.length > MAX_MESSAGE_LENGTH) {
    options.files = [...options.files ?? [], new AttachmentBuilder(Buffer.from(options.content), { name: 'response.txt' })];
    delete options.content;
  }

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
  else throw new Error(`Unsupported Class! Got ${this.constructor.name}`);

  if (msg?.deletable && !Number.isNaN(Number.parseInt(deleteTime))) setTimeout(msg.delete.bind(msg), deleteTime);
  return msg;
};