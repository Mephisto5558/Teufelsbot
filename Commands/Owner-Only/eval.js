const { Command } = require("reconlx");

module.exports = new Command({
  name: 'eval',
  aliases: [],
  description: `inject javascript code directly into the bot`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  prefixCommand: true,
  slashCommand: false,
  beta: true,

  run: async(client, message) => {

    let permissionGranted = await client.functions.checkBotOwner(client, message);
    if (!permissionGranted || !message.args) return;
    message.content = message.args.join(' ');

    client.log(`evaluated command '${message.content}'`);

    try {
      await eval(message.content);
    }
    catch (err) {
      console.error(err);
      return client.functions.reply('```\n' + err + '\n```', message);
    }

    client.functions.reply(
      'evaluated command:\n' +
      '```javascript\n' +
      message.content + '```', message
    )

  }
})