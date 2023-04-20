const { CommandInteraction, Message } = require('discord.js');

/**
 * @param {String|Number} options string is treated like `{content: options}`
 * @param {?Number} deleteTime Number in Milliseconds
 * @param {?object} allowedMentions https://discord.js.org/#/docs/discord.js/main/typedef/MessageMentionOptions @default { repliedUser: false }
*/
module.exports = async function customReply(options, deleteTime, allowedMentions = { repliedUser: false }) {
  let msg;

  if (typeof options != 'object') options = { content: options };
  options.allowedMentions ??= allowedMentions;

  if (this instanceof CommandInteraction) {
    try { msg = await ((this.replied || this.deferred) ? this.editReply(options) : this.reply(options)); }
    catch {
      try { msg = await this.followUp(options); }
      catch { msg = await this.channel.send(options); }
    }
  }
  else if (this instanceof Message) {
    try { msg = await (this.editable ? this.edit(options) : this.reply(options)); }
    catch { msg = await this.channel.send(options); }
  }
  else throw new Error(`Unsupported Class! Got ${this.constructor.name}`);

  if (!isNaN(deleteTime ?? NaN) && msg?.deletable) setTimeout(msg.delete.bind(msg), deleteTime);
  return msg;
};