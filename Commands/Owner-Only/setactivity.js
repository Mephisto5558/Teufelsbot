const { Command } = require("reconlx");
const availableTypes = ["playing", "streaming", "listening", "watching", "competing"];

module.exports = new Command({
  name: 'setactivity',
  aliases: [],
  description: `sets the bot's activity`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {

    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if (!permissionGranted) return;

    const messageArgs = message.content.split(";").map(element => {
      return element.trim();
    });

    let activity = messageArgs[0];
    let type = messageArgs[1];

    if (!type) type = 0;

    const numType = type
      .replace('playing', 0).replace('streaming', 1)
      .replace('listening', 2).replace('watching', 3)
      .replace('competing', 5);

    const typeIsAvailable = availableTypes.some(element => {
      if (element === type.toLowerCase()) return true;
    });

    if (!typeIsAvailable)
      return client.functions.reply(`Syntax error: Invalid type "${type}". Available types are:\n\`${availableTypes.toString().replace(/,/g, "\`, \`")}\``, message);

    client.user.setActivity({ name: activity, type: numType });
    client.functions.reply(`Activity set to \`${activity}\` of type \`${type}\``, message)

  }
})