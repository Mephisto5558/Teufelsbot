const
  { AllowedMentionsTypes, PermissionFlagsBits } = require('discord.js'),
  cooldowns = require('../cooldowns.js');

module.exports = { runMessages, removeAfkStatus };

/** @this {Message}*/
function replyToTriggers() {
  const triggerList = Object.values(this.guild.db.triggers ?? {}).filter(e => this.originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())).slice(0, 3);
  if (!triggerList.length || cooldowns.call(this, 'triggers', { channel: 1e4 })) return;

  for (const trigger of triggerList) this.customReply(trigger.response);
}

/** @this {Message}*/
async function handleCounting() {
  const countingData = this.guild.db.channelMinigames?.counting?.[this.channel.id];
  if (!countingData) return;

  if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
    await this.guild.updateDB(`channelMinigames.counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
    return this.react('✅');
  }

  this.react('❌');
  if (!countingData.lastNumber) return;

  await this.guild.updateDB(`channelMinigames.counting.${this.channel.id}`, { lastNumber: 0 });
  return this.reply(
    this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.counting.error', countingData.lastNumber)
    + this.client.i18n.__(
      { locale: this.guild.localeCode },
      countingData.lastAuthor == this.user.id ? 'events.message.counting.sameUserTwice' : 'events.message.counting.wrongNumber'
    )
  );
}

/** @this {Message}*/
async function handleWordchain() {
  const wordchainData = this.guild.db.channelMinigames?.wordchain?.[this.channel.id];
  if (!wordchainData) return;

  if (!wordchainData.lastWordChar || wordchainData.lastWordChar == this.originalContent[0].toLowerCase() /* && wordchainData.lastAuthor != this.user.id*/) {
    await this.guild.updateDB(
      `channelMinigames.wordchain.${this.channel.id}`,
      { lastWordChar: this.originalContent.at(-1).toLowerCase(), lastAuthor: this.user.id, chainedWords: wordchainData.chainedWords + 1 }
    );
    return this.react('✅');
  }

  this.react('❌');
  if (!wordchainData.lastWordChar) return;

  await this.guild.updateDB(`channelMinigames.wordchain.${this.channel.id}`, { chainedWords: 0 });
  return this.reply(
    this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.wordchain.error', { lastChar: wordchainData.lastWordChar, count: wordchainData.chainedWords })
    + this.client.i18n.__(
      { locale: this.guild.localeCode },
      wordchainData.lastAuthor == this.user.id ? 'events.message.wordchain.sameUserTwice' : 'events.message.wordchain.wrongChar'
    )
  );
}

/** @this {Message|import('discord.js').VoiceState}*/
async function removeAfkStatus() {
  if (!this.member || !this.channel || !this.guild) return; // `!this.channel || !this.guild` as typeguard

  if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.slice(6));

  const { createdAt, message } = this.guild.db.afkMessages?.[this.member.id] ?? this.member.user.db.afkMessage ?? {}; // `member.user` for VoiceState support
  if (!message) return;

  await this.client.db.delete('userSettings', `${this.member.id}.afkMessage`);
  await this.client.db.delete('guildSettings', `${this.guild.id}.afkMessages.${this.member.id}`);

  const msg = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkEnd', { timestamp: Math.round(createdAt.getTime() / 1000), message });
  if ('customReply' in this) return this.customReply(msg);
  if (this.channel.permissionsFor(this.member.id).has(PermissionFlagsBits.SendMessages) && this.channel.permissionsFor(this.client.user.id).has(PermissionFlagsBits.SendMessages))
    return this.channel.send(`<@${this.member.id}>\n` + msg);
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

/**
 * @type {Message['runMessages']}
 * @this {Message}
 * this is here due to eslint.*/
function runMessages() {
  if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, 'botMentionReaction', { user: 5000 }))
    this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (this.guild.db.triggers) replyToTriggers.call(this);
  if (Number(this.originalContent)) handleCounting.call(this);

  // Regex to match any letter from any language (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes)
  else if (/^\p{L}+$/u.test(this.originalContent)) handleWordchain.call(this);
  if (!this.originalContent.toLowerCase().includes('--afkignore')) removeAfkStatus.call(this);
  if (!cooldowns.call(this, 'afkMsg', { channel: 1e4, user: 1e4 })) sendAfkMessages.call(this);

  return this;
}