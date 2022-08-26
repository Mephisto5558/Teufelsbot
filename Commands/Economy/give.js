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
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White
    });
    let amount = message.options?.getString('amount') || message.args?.[1];

    if (!target) embed.data.description = lang('error.noTarget');
    else if (target.id == message.user.id) embed.data.description = lang('error.self');
    else if (target.bot) embed.data.description = lang('error.bot');
    else if (!amount) embed.data.description = lang('error.noAmount');

    if (embed.data.description) return functions.reply({ embeds: [embed] }, message);

    const
      userData = db.get('guildSettings')[message.guild.id].economy[message.user.id],
      targetData = db.get('guildSettings')[message.guild.id].economy[target.id];

    if (!userData.currency) {
      embed.data.description = lang('error.noMoney');
      return functions.reply({ embeds: [embed] }, message);
    }
    else if (!targetData?.gaining?.chat) {
      embed.data.description = lang('error.targetEconomyNotInitialized')
    }
    else if (isNaN(amount.replace('%', ''))) amount = userData.currency / 10;
    else if (amount.includes('%')) amount = userData.currency * amount.replace(/[^/d]/g, '') / 100;

    amount = amount.limit({ min: 1, max: userData.currency }).limit({ min: 1, max: targetData.currencyCapacity });

    const newUserCurrency = userData.currency - amount;
    const newTargetCurrency = targetData.currency + amount;

    await db.set('guildSettings', db.get('guildSettings').merge({
      [message.guild.id]: { economy: { [message.user.id]: { currency: newUserCurrency }, [target.id]: { currency: newTargetCurrency } } }
    }));

    embed.data.description = lang('embedDescription', amount, target, newUserCurrency, newTargetCurrency);
    functions.reply({ content: target.toString(), embed: [embed] }, message);
  }
})