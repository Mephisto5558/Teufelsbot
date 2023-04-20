const
  cooldowns = require('../cooldowns.js'),
  I18nProvider = require('../I18nProvider.js');

/**@this {import('discord.js').Message}*/
module.exports = function runMessages() {
  const { afkMessages = {}, triggers = {}, counting: { [this.channel.id]: countingData } = {} } = this.guild.db;

  if (this.client.botType != 'dev' && triggers.length && !cooldowns.call(this, { name: 'triggers', cooldowns: { user: 10000 } }))
    for (const trigger of triggers.filter(e => this.originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())).slice(0, 3))
      this.customReply(trigger.response);
  else if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, { name: 'botMentionReaction', cooldowns: { user: 5000 } }))
    this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (countingData && Number(this.originalContent)) {
    if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
      this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
      this.react('✅');
    }
    else {
      this.react('❌');

      if (countingData.lastNumber != 0) {
        this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { user: null, lastNumber: 0 });
        this.reply(I18nProvider.__({ locale: this.guild.localeCode }, 'events.counting.error', countingData.lastNumber) + I18nProvider.__({ locale: this.guild.localeCode }, countingData.lastNumber + 1 != this.originalContent ? 'events.counting.wrongNumber' : 'events.counting.sameUserTwice'));
      }
    }
  }

  const { createdAt, message } = (afkMessages[this.user.id]?.message ? afkMessages[this.user.id] : this.user.db.afkMessage) ?? {};
  if (message && !this.originalContent.toLowerCase().includes('--afkignore')) {
    this.client.db.update('userSettings', `${this.user.id}.afkMessage`, {});
    this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`, {});
    if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.substring(6));
    this.customReply(I18nProvider.__({ locale: this.guild.localeCode }, 'events.afkEnd', { timestamp: createdAt, message }));
  }

  if (cooldowns.call(this, { name: 'afkMsg', cooldowns: { user: 10000 } })) return this;

  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = (afkMessages[e.id]?.message ? afkMessages[e.id] : e.user.db.afkMessage) ?? {};
    if (!message || e.id == this.user.id) return acc;

    const afkMessage = I18nProvider.__({ locale: this.guild.localeCode }, 'events.afkMsg', {
      member: e.nickname?.startsWith('[AFK] ') ? e.nickname.substring(6) : e.displayName,
      message, timestamp: createdAt
    });

    if (acc.length + afkMessage.length >= 2000) {
      this.customReply(acc);
      acc = '';
    }

    return `${acc}${afkMessage}\n`;
  }, '');

  if (afkMsgs.length) this.customReply(afkMsgs);
  return this;
};