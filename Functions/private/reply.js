const { CommandInteraction } = require('discord.js')

module.exports = async function customreply(reply, deleteTime, allowedMentions = { repliedUser: false }) {
  let sentMessage;

  if (typeof reply != 'object') reply.content = reply;
  if (!reply.allowedMentions) reply.allowedMentions = allowedMentions;

  if (this instanceof CommandInteraction) {
    try { sentMessage = this.replied ? this.editReply(reply) : this.reply(reply) }
    catch {
      try { sentMessage = this.followUp(reply) }
      catch { sentMessage = this.channel.send(reply) }
    }
  }
  else {
    try { sentMessage = await this.reply(reply) }
    catch { sentMessage = await this.channel.send(reply) }
  }

  if (!isNaN(deleteTime) && (await sentMessage).deletable !== false && !this.ephemeral) return setTimeout(sentMessage.delete, deleteTime);

  return sentMessage;
}