const { Command } = require("reconlx");

module.exports = new Command({
  name: 'eval',
  aliases: ['runcode'],
  description: `inject javascript code directly into the bot`,
  permissions: {client: [], user: []},
  category : "Owner-Only",
  slashCommand: false,
  prefiCommand: true,
  run: async (client, message, interaction) => {
    
    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if(!permissionGranted || !message.args) return;

    message.args = message.args.join(' ')
    if(!message.args) return;
    
    await function eval(client, message) {
      return Function('return (' + message.args + ')')();
    }
    try {
      eval(message.args);
    }
    catch(err) {client.functions.reply(`\`\`\`${err}\`\`\``, message)}
    console.log(`evaluated command '${message.args}'`)
    client.functions.reply(`evaluated command:
\`\`\`javascript\n${message.args}\`\`\``, message)
    
  }
})