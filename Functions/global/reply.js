const { CommandInteraction } = require('discord.js')

module.exports = async (reply, message, deleteTime, ping) => {
  let sentMessage;

  if (!message || !reply) throw new SyntaxError(`reply.js: Missing var in code: ${!message ? 'message' : 'reply'}`);

  if (typeof reply != 'object') reply.content = reply;

  if (!reply.allowedMentions) reply.allowedMentions = { repliedUser: ping || false };
  else reply.allowedMentions.repliedUser = ping || false;

  if (message instanceof CommandInteraction) {
    try {
      if (message.replied) sentMessage = await message.editReply(reply);
      else throw Error();
    }
    catch {
      try { sentMessage = await message.followUp(reply) }
      catch { sentMessage = await message.channel.send(reply) }
    }
  }
  else {
    try { sentMessage = await message.reply(reply) }
    catch { sentMessage = await message.channel.send(reply) }
  }

  if (!isNaN(deleteTime) && sentMessage.deletable !== false && !message.ephemeral) return setTimeout(sentMessage.delete, deleteTime);

  return sentMessage;
}
