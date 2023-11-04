const { BaseInteraction, Message, DiscordAPIError } = require('discord.js');

/**@param {Error}err @returns `true` if no err is given, false on specific error codes*/
function handleError(err) {
  if (!err) return true;
  if (!(err instanceof DiscordAPIError)) throw err;

  log.debug(`An error occurred while trying to send message: ${err}`);
  return err.code != 10062;
}

/**
 * @this Interaction|Message
 * @param {string | import('discord.js').MessageEditOptions | import('discord.js').MessagePayload} options
 * @param {number?} deleteTime Number in Milliseconds
 * @param {object?} allowedMentions https://discord.js.org/#/docs/discord.js/main/typedef/MessageMentionOptions @default { repliedUser: false }
*/
module.exports = async function customReply(options, deleteTime = null, allowedMentions = { repliedUser: false }) {
  let msg;

  if (typeof options != 'object') options = { content: options };
  options.allowedMentions ??= allowedMentions;

  if (this instanceof BaseInteraction) {
    try { msg = await ((this.replied || this.deferred) ? this.editReply(options) : this.reply(options)); }
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

  if (!isNaN(deleteTime ?? NaN) && msg?.deletable) setTimeout(msg.delete.bind(msg), deleteTime);
  return msg;
};