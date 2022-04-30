const { Command } = require("reconlx");

module.exports = new Command({
  name: 'eval',
  aliases: ['runcode'],
  description: `inject javascript code directly into the bot`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  prefixCommand: true,
  slashCommand: false,

  run: async(client, message) => {

    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if (!permissionGranted || !message?.content) return;

    function eval(client, message) {
      return Function('return (' + message.content + ')')();
    }

    console.log(`evaluated command '${message.content}'`)
    client.functions.reply(
      'evaluated command:\n' +
      '```javascript\n' +
      message.content + '```', message)

    //try {
      eval(message.content);
    //} catch (err) { client.functions.reply('```\n' + err + '\n```', message) }

  }
})