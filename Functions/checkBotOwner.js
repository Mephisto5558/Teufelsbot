module.exports = async function reply(client, message) {
  if (message.author.id == client.owner) return true;

  await client.functions.reply("You don't have the permission to do that!", message);
  return false;
}