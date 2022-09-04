const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'give',
  aliases: { prefix: [], slash: [] },
  description: 'give some souls to someone',
  usage: 'give [user] [amount]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  requireEconomy: true,
  options: [
    {
      name: 'user',
      description: 'the user you want to give money',
      type: 'User',
      required: true
    },
    {
      name: 'amount',
      description: 'how much do you want to give? The minimum is one.',
      type: 'String',
      required: true
    }
  ],
  beta: true,

  run: async (message, lang, { db }) => {
    const target = message.options?.getUser('user') || message.mentions?.users?.first();
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White
    });

    let amount = message.options?.getString('amount') || message.args?.[1];

    if (!target) embed.data.description = lang('error.noTarget');
    else if (target.id == message.user.id) embed.data.description = lang('error.self');
    else if (target.bot) embed.data.description = lang('error.bot');
    else if (!amount) embed.data.description = lang('error.noAmount');

    if (embed.data.description) return message.customReply({ embeds: [embed] });

    const
      userData = db.get('guildSettings')[message.guild.id].economy[message.user.id],
      targetData = db.get('guildSettings')[message.guild.id].economy[target.id];

    if (!userData.currency) {
      embed.data.description = lang('error.noMoney');
      return message.customReply({ embeds: [embed] });
    }
    else if (!targetData?.gaining?.chat) embed.data.description = lang('error.targetEconomyNotInitialized');
    else if (isNaN(amount.replace('%', ''))) amount = userData.currency / 10;
    else if (amount.includes('%')) amount = userData.currency * amount.replace(/[^/d]/g, '') / 100;

    amount = parseInt(amount).limit({ min: 0.1, max: userData.currency }).limit({ max: targetData.currencyCapacity });

    const newUserCurrency = (userData.currency - amount).toFixed(3);
    const newTargetCurrency = (targetData.currency + amount).toFixed(3);

    db.set('guildSettings', db.get('guildSettings').fMerge({
      [message.guild.id]: { economy: { [message.user.id]: { currency: newUserCurrency }, [target.id]: { currency: newTargetCurrency } } }
    }));

    embed.data.description = lang('embedDescription', { amount, target: target.id, newUserAmount: newUserCurrency, newTargetAmount: newTargetCurrency });
    message.customReply({ content: target.toString(), embeds: [embed] });
  }
}