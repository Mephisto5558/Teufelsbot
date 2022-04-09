module.exports = async function reply(reply, message, deleteTime = false, ping = false) {
  if (!message) return console.error('reply.js: Missing var in code: message')
  var sentMessage = ''
  try {
    await message.reply({
      content: reply,
      allowedMentions: { repliedUser: ping }
    }).then(msg => { sentMessage = msg})
  }
  catch(error) {
    await message.channel.send(reply)
      .then(msg => { sentMessage = msg})
  }
  
  if(!deleteTime === false && !isNaN(deleteTime)) {
    setTimeout(() => sentMessage.delete(), deleteTime)
  }
}