const { Message, CommandInteraction } = require('discord.js');

module.exports = {
  name: 'purge',
  aliases: { prefix: ['clear'], slash: [] },
  permissions: { client: ['ManageMessages'], user: ['ManageMessages'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: 'amount',
    type: 'Number',
    minValue: 1,
    maxValue: 1000,
    required: true
  }],

  run: async function (lang, { functions }) {
    const amount = parseInt(this.options?.getNumber('amount') || this.args?.[0]).limit({ min: 0, max: 1000 });

    if (!amount) return this.customReply(isNaN(amount) ? lang('invalidNumber') : lang('noNumber'));
    if (this instanceof Message) await this.delete();

    for (let i = 0; i < amount; i += 100) {
      await this.channel.bulkDelete((amount - i).limit({ max: 100 }), true);
      if (amount - i < 1) await functions.sleep(2000);
    }

    if (this instanceof CommandInteraction) this.editReply(lang('success'));
  }
};