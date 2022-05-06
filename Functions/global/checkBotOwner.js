module.exports = async function reply(client, message) {
  if (message.author.id == client.owner) return true;
  else return false;
}