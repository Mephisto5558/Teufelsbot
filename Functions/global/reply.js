let sentMessage;

module.exports = async function reply(reply, message, deleteTime, ping) {

  if (!message) throw new SyntaxError('reply.js: Missing var in code: message');
  if (!reply) throw new SyntaxError('reply.js: Missing var in code: reply');

  if (typeof reply != 'object') reply.content = reply;
  reply.allowedMentions = { repliedUser: ping || false };

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
