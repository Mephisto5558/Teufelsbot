const
  { AllowedMentionsTypes } = require('discord.js'),
  cooldowns = require('../cooldowns.js');

/** @this {Message}*/
function replyToTriggers() {
  const triggerList = Object.values(this.guild.db.triggers ?? {}).filter(e => this.originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())).slice(0, 3);
  if (!triggerList.length || cooldowns.call(this, 'triggers', { channel: 1e4 })) return;

  for (const trigger of triggerList) this.customReply(trigger.response);
}

/** @this {Message}*/
async function handleCounting() {
  const countingData = this.guild.db.counting[this.channel.id];
  if (!countingData) return;

  if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
    await this.guild.updateDB(`counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
    return this.react('✅');
  }

  this.react('❌');
  if (!countingData.lastNumber) return;

  await this.guild.updateDB(`counting.${this.channel.id}`, { lastNumber: 0 });
  return this.reply(
    this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.counting.error', countingData.lastNumber)
    + this.client.i18n.__(
      { locale: this.guild.localeCode },
      countingData.lastAuthor == this.user.id ? 'events.message.counting.sameUserTwice' : 'events.message.counting.wrongNumber'
    )
  );
}

/** @this {Message}*/
async function removeAfkStatus() {
  if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.slice(6));

  const { createdAt, message } = this.guild.db.afkMessages?.[this.user.id] ?? this.user.db.afkMessage ?? {};
  if (!message) return;

  await this.client.db.delete('userSettings', `${this.user.id}.afkMessage`);
  await this.client.db.delete('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`);
  return this.customReply(this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkEnd', { timestamp: Math.round(createdAt.getTime() / 1000), message }));
}

/** @this {Message}*/
function sendAfkMessages() {
  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[this.user.id] ?? this.user.db.afkMessage ?? {};
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

  if (afkMsgs.length) return this.customReply({ content: afkMsgs, allowedMentions: { parse: [AllowedMentionsTypes.User] } });
}

/** @type {Message['runMessages']}*/
module.exports = function runMessages() {
  if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, 'botMentionReaction', { user: 5000 }))
    this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (this.guild.db.triggers) replyToTriggers();
  if (Number(this.originalContent)) handleCounting();
  if (!this.originalContent.toLowerCase().includes('--afkignore')) removeAfkStatus();
  if (!cooldowns.call(this, 'afkMsg', { channel: 1e4, user: 1e4 })) sendAfkMessages();

  return this;
};