const
  { ChannelType } = require('discord.js'),
  cooldowns = require('../cooldowns.js');

/**@this {import('discord.js').Message} */
module.exports = function runEco() {
  const { config: { gaining: cGaining = {}, blacklist: cBlacklist = {} } = {}, [this.user.id]: { gaining, currency, currencyCapacity, skills } = {} } = this.guild.db.economy ?? {};

  if (
    this.channel.type != ChannelType.DM && this.guild.db.economy?.enable && gaining?.chat && currency >= currencyCapacity &&
    this.content.length > (cGaining.chat?.min_message_length ?? this.client.defaultSettings.economy.gaining.chat.min_message_length) &&
    this.content.length < (cGaining.chat?.max_message_length ?? this.client.defaultSettings.economy.gaining.chat.max_message_length) &&
    !cBlacklist.channel?.includes(this.channel.id) && !cBlacklist.users?.includes(this.user.id) &&
    !this.member.roles.cache.hasAny(cBlacklist.roles) && !cooldowns.call(this, { name: 'economy', cooldowns: { user: 2e4 } })
  ) this.client.db.update('guildSettings', `${this.guild.id}.economy.${this.user.id}.currency`, parseFloat((currency + gaining.chat + skills.currency_bonus_absolute.lvl ** 2 + gaining.chat * skills.currency_bonus_percentage.lvl ** 2 / 100).limit(0, currencyCapacity).toFixed(3)));

  return this;
};