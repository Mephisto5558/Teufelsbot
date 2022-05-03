let sentMessage;
module.exports = async function reply(reply, message, deleteTime = false, ping = false) {
  if (!message) return console.error('reply.js: Missing var in code: message')

  try {
    if (reply === MessageEmbed) {
      await message.reply({
        embeds: [reply],
        allowedMentions: { repliedUser: ping }
      }).then(msg => { sentMessage = msg })
    } else {
      await message.reply({
        content: reply,
        allowedMentions: { repliedUser: ping }
      }).then(msg => { sentMessage = msg })
    }
  } catch (err) {
    await message.channel.send(reply)
      .then(msg => { sentMessage = msg })
  }

  if (deleteTime && !isNaN(deleteTime)) {
    setTimeout(_ => sentMessage.delete(), deleteTime)
  }
}