const
  { AllowedMentionsTypes } = require('discord.js'),
  cooldowns = require('../cooldowns.js');

/** @type {Message['runMessages']}*/
module.exports = async function runMessages() {
  const
    { afkMessages = {}, triggers = {}, counting: { [this.channel.id]: countingData } = {} } = this.guild.db,
    triggerList = Object.values(triggers).filter(e => this.originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())).slice(0, 3);

  if (this.client.botType != 'dev' && triggerList.length && !cooldowns.call(this, 'triggers', { channel: 1e4 }))
    for (const trigger of triggerList) this.customReply(trigger.response);
  else if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, 'botMentionReaction', { user: 5000 }))
    this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (countingData && Number(this.originalContent)) {
    if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
      await this.guild.updateDB(`counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
      this.react('✅');
    }
    else {
      this.react('❌');

      if (countingData.lastNumber != 0) {
        await this.guild.updateDB(`counting.${this.channel.id}`, { lastNumber: 0 });
        this.reply(
          this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.counting.error', countingData.lastNumber)
          + this.client.i18n.__(
            { locale: this.guild.localeCode },
            countingData.lastAuthor == this.user.id ? 'events.message.counting.sameUserTwice' : 'events.message.counting.wrongNumber'
          )
        );
      }
    }
  }

  if (!this.originalContent.toLowerCase().includes('--afkignore')) {
    if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.slice(6));

    const { createdAt, message } = (this.user.id in afkMessages ? afkMessages[this.user.id] : this.user.db.afkMessage) ?? {};
    if (message) {
      await this.client.db.delete('userSettings', `${this.user.id}.afkMessage`);
      await this.client.db.delete('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`);
      this.customReply(this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkEnd', { timestamp: Math.round(createdAt.getTime() / 1000), message }));
    }
  }


  if (cooldowns.call(this, 'afkMsg', { channel: 1e4, user: 1e4 })) return this;

  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = (e.id in afkMessages ? afkMessages[e.id] : e.user.db.afkMessage) ?? {};
    if (!message || e.id == this.user.id) return acc;

    const afkMessage = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkMsg', {
      member: e.nickname?.startsWith('[AFK] ') ? e.nickname.slice(6) : e.displayName,
      message, timestamp: Math.round(createdAt / 1000)
    });

    if (acc.length + afkMessage.length >= 2000) {
      this.customReply(acc);
      acc = '';
    }

    return `${acc}${afkMessage}\n`;
  }, '');

  if (afkMsgs.length) this.customReply({ content: afkMsgs, allowedMentions: { parse: [AllowedMentionsTypes.User] } });
  return this;
};