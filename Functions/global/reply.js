module.exports = async (reply, message, deleteTime, ping) => {
  let sentMessage;

  if (!message ||! reply) throw new SyntaxError(`reply.js: Missing var in code: ${!message?'message':'reply'}`);

  if (typeof reply != 'object') reply.content = reply;

  if(!reply.allowedMentions) reply.allowedMentions = { repliedUser: ping || false };
  else reply.allowedMentions.repliedUser = ping || false;

  try {
    await message.reply(reply)
      .then(msg => { sentMessage = msg });
  }
  catch {
    await message.channel.send(reply)
      .then(msg => { sentMessage = msg })
  }

  if (deleteTime && !isNaN(deleteTime)) {
    setTimeout(_ => sentMessage.delete(), deleteTime)
  }

}
