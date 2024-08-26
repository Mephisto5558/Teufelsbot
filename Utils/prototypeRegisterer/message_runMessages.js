const
  { AllowedMentionsTypes, PermissionFlagsBits } = require('discord.js'),
  cooldowns = require('../cooldowns.js');

module.exports = { runMessages, removeAfkStatus };

/** @this {Message}*/
function replyToTriggers() {
  if (cooldowns.call(this, 'triggers', { channel: 1e4 })) return;

  const responseList = new Set(Object.values(this.guild.db.triggers ?? {}).filter(e => this.originalContent?.toLowerCase().includes(e.trigger.toLowerCase())).map(e => e.response));
  for (const response of responseList) void this.customReply(response);
}

/** @this {Message}*/
async function handleCounting() {
  const countingData = this.guild.db.channelMinigames?.counting?.[this.channel.id];
  if (!countingData) return;

  if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
    await this.guild.updateDB(`channelMinigames.counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
    return this.react('✅');
  }

  void this.react('❌');
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

  const
    firstWord = this.originalContent.split(/ +/g)[0].toLowerCase(),
    lastWordChar = wordchainData.lastWord?.at(-1);

  if (
    !wordchainData.lastWord || lastWordChar == firstWord[0]
    && (!wordchainData.lastWordBefore || wordchainData.lastWordBefore != firstWord)
    && wordchainData.lastAuthor != this.user.id
  ) {
    await this.guild.updateDB(
      `channelMinigames.wordchain.${this.channel.id}`,
      {
        lastWord: firstWord, lastWordBefore: wordchainData.lastWord,
        lastAuthor: this.user.id, chainedWords: wordchainData.chainedWords + 1
      }
    );
    return this.react('✅');
  }

  void this.react('❌');
  if (!lastWordChar) return;

  let msgId;
  if (wordchainData.lastAuthor == this.user.id) msgId = 'events.message.wordchain.sameUserTwice';
  else if (firstWord == wordchainData.lastWordBefore) msgId = 'events.message.wordchain.inALoop';
  else msgId = 'events.message.wordchain.wrongChar';

  await this.guild.updateDB(`channelMinigames.wordchain.${this.channel.id}`, { chainedWords: 0 });
  if (wordchainData.chainedWords > 1) {
    return this.reply(
      this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.wordchain.error', { lastChar: lastWordChar, count: wordchainData.chainedWords })
      + this.client.i18n.__({ locale: this.guild.localeCode }, msgId)
    );
  }
}

/**
 * @type {import('.')['utils']['removeAfkStatus']}
 * @this {ThisParameterType<import('.')['utils']['removeAfkStatus']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
async function removeAfkStatus() {
  if (!this.member || !this.channel || !this.guild) return; // `!this.channel || !this.guild` as typeguard

  if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) void this.member.setNickname(this.member.nickname.slice(6));

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
async function sendAfkMessages() {
  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
    if (!message || e.id == this.user.id) return acc;

    const afkMessage = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkMsg', {
      member: e.nickname?.startsWith('[AFK] ') ? e.nickname.slice(6) : e.displayName,
      message, timestamp: Math.round(createdAt / 1000)
    });

    if (acc.length + afkMessage.length >= 2000) {
      void this.customReply(acc);
      acc = '';
    }

    return `${acc}${afkMessage}\n`;
  }, '');

  if (afkMsgs.length) return this.customReply({ content: afkMsgs, allowedMentions: { parse: [AllowedMentionsTypes.User] } });
}

/* eslint-disable jsdoc/valid-types -- `this` is set from `@type`, but `@typescript-eslint/no-invalid-this` does not recognize that.*/
/**
 * @type {import('.').runMessages}
 * @this*/ /* eslint-enable jsdoc/valid-types*/
function runMessages() {
  if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, 'botMentionReaction', { user: 5000 }))
    void this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (this.guild.db.triggers) replyToTriggers.call(this);
  if (Number(this.originalContent)) void handleCounting.call(this);

  // Regex to match any letter from any language (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes)
  else if (/^\p{L}+$/u.test(this.originalContent)) void handleWordchain.call(this);
  if (!this.originalContent.toLowerCase().includes('--afkignore')) void removeAfkStatus.call(this);
  if (!cooldowns.call(this, 'afkMsg', { channel: 1e4, user: 1e4 })) void sendAfkMessages.call(this);

  return this;
}