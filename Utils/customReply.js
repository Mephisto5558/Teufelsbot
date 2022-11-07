const { CommandInteraction, Message } = require('discord.js');

module.exports = async function customReply(options, deleteTime, allowedMentions = { repliedUser: false }) {
  let msg;

  if (typeof options != 'object') options = { content: options };
  if (!options.allowedMentions) options.allowedMentions = allowedMentions;

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

  if (!isNaN(deleteTime) && msg?.deletable) setTimeout(msg.delete.bind(msg), deleteTime);
  return msg;
};