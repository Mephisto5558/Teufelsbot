const { CommandInteraction, Message } = require('discord.js')

module.exports = async function customReply(reply, deleteTime, allowedMentions = { repliedUser: false }) {
  let sentMessage;

  if (typeof reply != 'object') reply = { content: reply };
  if (!reply.allowedMentions) reply.allowedMentions = allowedMentions;

  if (this instanceof CommandInteraction) {
    try { sentMessage = (this.replied || this.deferred) ? await this.editReply(reply) : await this.reply(reply) }
    catch {
      try { sentMessage = await this.followUp(reply) }
      catch { sentMessage = await this.channel.send(reply) }
    }
  }
  else if (this instanceof Message) {
    try { sentMessage = this.author.id == this.client.user.id ? await this.edit(reply) : await this.reply(reply) }
    catch { sentMessage = await this.channel.send(reply) }
  }
  else throw new Error(`Unsupported Class! Got ${this.constructor.name}`);

  if (!isNaN(deleteTime) && sentMessage?.deletable && !this.ephemeral) return setTimeout(sentMessage.delete.bind(sentMessage), deleteTime);

  return sentMessage;
}