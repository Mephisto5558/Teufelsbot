const
  { Command } = require('reconlx'),
  { Message } = require('discord.js');

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
    const amount = message.options?.getNumber('amount') || message.args?.[0];

    if (!amount) return message instanceof Message ? functions.reply(lang('noNumber'), message) : message.editReply(lang('noNumber'));

    let toDeleteCount = parseInt(amount || message.options?.getNumber('amount'))
    if (message instanceof Message) toDeleteCount++; //+1 is the command

    if (isNaN(toDeleteCount) || !toDeleteCount) return message instanceof Message ? functions.reply(lang('invalidNumber', amount), message): message.editReply(lang('invalidNumber', amount));
    else if (toDeleteCount > 1001) toDeleteCount = 1001;

    for (let i = 0; i < toDeleteCount; i = i + 100) {
      await message.channel.bulkDelete(toDeleteCount - i < 100 ? toDeleteCount - i : 100, true);
      if (toDeleteCount - i > 0) await functions.sleep(2000);
    }

    if (!(message instanceof Message)) message.editReply(lang('success'));
  }
})