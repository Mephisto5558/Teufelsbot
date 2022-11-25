const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'give',
  slashCommand: true,
  prefixCommand: true,
  requireEconomy: true,
  options: [
    {
      name: 'target',
      type: 'User',
      required: true
    },
    {
      name: 'amount',
      type: 'String',
      required: true
    }
  ],
  beta: true,

  run: function (lang) {
    const target = this.options?.getUser('target') || this.mentions?.users.first();
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White
    });

    let amount = this.options?.getString('amount') || this.args?.[1];

    if (!target) embed.data.description = lang('error.noTarget');
    else if (target.id == this.user.id) embed.data.description = lang('error.self');
    else if (target.bot) embed.data.description = lang('error.bot');
    else if (!amount) embed.data.description = lang('error.noAmount');

    if (embed.data.description) return this.customReply({ embeds: [embed] }, 3e4);

    const
      userData = this.guild.db.economy?.[this.user.id],
      targetData = this.guild.db.economy?.[target.id];

    if (!userData.currency) {
      embed.data.description = lang('error.noMoney');
      return this.customReply({ embeds: [embed] });
    }
    if (!targetData?.gaining?.chat) {
      embed.data.description = lang('error.targetEconomyNotInitialized');
      return this.customReply({ embeds: [embed] });
    }

    if (isNaN(amount.replace('%', ''))) amount = userData.currency / 10;
    else if (amount.includes('%')) amount = userData.currency * amount.replace(/[^/d]/g, '') / 100;

    amount = parseInt(amount).limit({ min: 0.1, max: userData.currency }).limit({ max: targetData.currencyCapacity });

    const newUserCurrency = parseFloat((userData.currency - amount).toFixed(3));
    const newTargetCurrency = parseFloat((targetData.currency + amount).toFixed(3));

    this.client.db.update('guildSettings', `${this.guild.id}.economy`, { [this.user.id]: { currency: newUserCurrency }, [target.id]: { currency: newTargetCurrency } });

    embed.data.description = lang('embedDescription', { amount, target: target.id, newUserAmount: newUserCurrency, newTargetAmount: newTargetCurrency });
    this.customReply({ content: target.toString(), embeds: [embed] });
  }
};