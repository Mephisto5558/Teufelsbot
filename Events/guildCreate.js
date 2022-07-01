module.exports = async (client, guild) => {
  try {
    await require('../Handlers/slash_command_handler.js')(client, guild);
  } catch { };
}