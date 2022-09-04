const { CommandInteraction } = require('discord.js')

module.exports = async function customReply(reply, deleteTime, allowedMentions = { repliedUser: false }) {
  let sentMessage;

  if (typeof reply != 'object') reply.content = reply;
  if (!reply.allowedMentions) reply.allowedMentions = allowedMentions;

  if (this instanceof CommandInteraction) {
    try { sentMessage = this.replied ? await this.editReply(reply) : await this.reply(reply) }
    catch {
      try { sentMessage = await this.followUp(reply) }
      catch { sentMessage = await this.channel.send(reply) }
    }
  }
  else {
    try { sentMessage = await this.reply(reply) }
    catch { sentMessage = await this.channel.send(reply) }
  }

  if (!isNaN(deleteTime) && sentMessage?.deletable && !this.ephemeral) return setTimeout(sentMessage.delete.bind(sentMessage), deleteTime);

  return sentMessage;
}