const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'give',
  aliases: { prefix: [], slash: [] },
  description: 'give some souls to someone',
  usage: 'give [user] [amount]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'user',
      description: 'the user you want to give money',
      type: 'User',
      required: true
    },
    {
      name: 'amount',
      description: 'how much do you want to give?',
      type: 'String',
      required: true
    }
  ],
  beta: true,

  run: async (message, lang, { functions, db }) => {
    const target = message.options?.getUser('user') || message.mentions?.users.first();
    if (!target || target.id == message.user.id) return functions.reply(lang('noTarget'));

    let amount = message.options?.getString('amount') || message.args?.[1];
    const
      userData = db.get('guildSettings')[message.guild.id]?.economy?.[message.user.id],
      targetData = db.get('guildSettings')[message.guild.id]?.economy?.[target.id];

    if (isNaN(amount.replace('%', ''))) amount = userData.currency / 10;
    else if (amount.includes('%')) amount = userData.currency * amount.replace(/[^/d]/g, '') / 100;
    else if (amount > userData.currency) amount = userData.currency;

    if (amount > targetData.currencyCapacity) amount = targetData.currencyCapacity;

    const newUserCurrency = userData.currency - amount;
    const newTargetCurrency = targetData.currency + amount;

    await db.set('guildSettings', Object.merge(db.get('guildSettings'), {
      [message.guild.id]: { economy: { [message.user.id]: { currency: newUserCurrency }, [target.id]: { currency: newTargetCurrency } } }
    }));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', amount, target, newUserCurrency, newTargetCurrency),
      color: Colors.White
    });

    functions.reply({ content: target.toString(), embed: [embed] });
  }
})