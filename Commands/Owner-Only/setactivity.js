const { Command } = require("reconlx");
const validTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];

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

    const messageArgs = message.args.join(' ')
      .split(';').map(element => {
        return element.trim();
      });

    let activity = messageArgs[0];
    let type = messageArgs[1];

    if (!type) type = 'PLAYING';

    const typeIsAvailable = validTypes.some(element => {
      if (element.toLowerCase() == type.toLowerCase()) return true;
      else if (['1','2','3','5'].includes(element)) return true;
    });

    if (!typeIsAvailable)
      return client.functions.reply(`Syntax error: Invalid type "${type}". Available types are:\n\`${validTypes.join(', ')}.`, message);

    type = type.toUpperCase();
    
    client.user.setActivity(activity, { type: type })
    
    client.functions.reply(`Activity set to \`${activity}\` of type \`${type}\``, message);
    
  }
})