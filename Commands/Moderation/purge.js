const
  { Command } = require('reconlx'),
  { Message, CommandInteraction } = require('discord.js');

module.exports = new Command({
  name: 'purge',
  aliases: { prefix: ['clear'], slash: [] },
  description: 'removes a specific number of messages',
  usage: 'PREFIX Command: purge <number>',
  permissions: { client: ['ManageMessages'], user: ['ManageMessages'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: 'amount',
    description: 'The amount of messages to purge',
    type: 'Number',
    minValue: 1,
    maxValue: 1000
  }],

  run: async (message, lang, { functions }) => {
    let amount = parseInt(message.options?.getNumber('amount') || message.args?.[0]).limit({ max: 1000 });

    if (!amount) return functions.reply(isNaN(amount) ? lang('invalidNumber') : lang('noNumber'), message);
    if (message instanceof Message) amount++; //+1 is the command

    for (let i = 0; i <= amount; i += 100) {
      await message.channel.bulkDelete((amount - i).limit({ max: 100 }), true);
      if (amount - i) await functions.sleep(2000);
    }

    if (message instanceof CommandInteraction) message.editReply(lang('success'));
  }
})