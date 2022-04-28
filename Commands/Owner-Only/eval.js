const { Command } = require("reconlx");

module.exports = new Command({
  name: 'eval',
  aliases: ['runcode'],
  description: `inject javascript code directly into the bot`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message, _) => {

    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if (!permissionGranted) return;

    message.args = message.args.join(' ');
    if (!message.args) return;

    function eval(client, message) {
      return Function('return (' + message.args + ')')();
    }

    console.log(`evaluated command '${message.args}'`)
    client.functions.reply(
      'evaluated command:\n' +
      '```javascript\n' +
      message.args + '```', message)

    try {
      eval(message.args);
    } catch (err) { client.functions.reply('```\n' + err + '\n```', message) }

  }
})