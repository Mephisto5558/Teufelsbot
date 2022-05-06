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

    let permissionGranted = await client.functions.checkBotOwner(client, message);
    if (!permissionGranted || !message.args) return;
    message.content = message.args.join(' ');

    function eval(client, message) {
      return Function(`return ( ${message.content} )`)(client, message);
    }

    console.log(`evaluated command '${message.content}'`)
    client.functions.reply(
      'evaluated command:\n' +
      '```javascript\n' +
      message.content + '```', message)

    try {
      await eval(client, message);
    } catch (err) { console.error(err);client.functions.reply('```\n' + err + '\n```', message) }

  }
})