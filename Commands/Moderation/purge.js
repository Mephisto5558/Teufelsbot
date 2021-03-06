const { Command } = require('reconlx');

module.exports = new Command({
  name: 'purge',
  aliases: { prefix: ['clear'], slash: [] },
  description: 'removes a specific number of messages',
  usage: 'PREFIX Command: purge <number>',
  permissions: { client: ['ManageMessages'], user: ['ManageMessages'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Moderation',
  slashCommand: false,
  prefixCommand: true,

  run: async ({ functions }, message) => {
    if (!message.args.length) functions.reply('Please specify the number of messages to purge next time.', message);

    let toDeleteCount = parseInt(message.args[0]) + 1; //+1 is the command
    if (isNaN(toDeleteCount) || toDeleteCount <= 1) functions.reply(`\`${message.args[0]}\` is not a valid number.`, message)
    else if (toDeleteCount > 1001) toDeleteCount = 1001;

    for (let i = 0; i < toDeleteCount; i = i + 100) {
      await message.channel.bulkDelete(toDeleteCount - i < 100 ? toDeleteCount - i : 100, true);
      if (toDeleteCount - i > 0) await functions.sleep(2000);
    }
  }
})
//nachfrage wenn user = admin //nachfrage allgemein;