const
  { bold } = require('discord.js'),
  cooldowns = require('../cooldowns.js'),
  { removeAfkStatus, sendAfkMessages } = require('../afk.js'),
  { secToMs } = require('../toMs.js'),
  MESSAGES_COOLDOWN = secToMs(5), /* eslint-disable-line @typescript-eslint/no-magic-numbers */
  WORDCOUNT_MIN_CHARS = 3;

module.exports = { runMessages };

/** @this {Message<true>} */
function replyToTriggers() {
  if (!Number(this.guild.db.triggers?.__count__) || cooldowns.call(this, 'triggers', { channel: secToMs(10) })) return;

  const responseList = Object.values(this.guild.db.triggers)
    .filter(e => !!this.originalContent?.toLowerCase().includes(e.trigger.toLowerCase())).map(e => e.response);
  for (const response of responseList.unique()) void this.customReply(response);
}

/** @this {Message<true>} */
async function handleCounting() {
  const countingData = this.guild.db.channelMinigames?.counting?.[this.channel.id];
  if (!countingData) return;

  if (countingData.lastNumber + 1 == this.originalContent && countingData.lastAuthor != this.user.id) {
    await this.guild.updateDB(`channelMinigames.counting.${this.channel.id}`, {
      lastNumber: countingData.lastNumber + 1,
      lastAuthor: this.user.id,
      highScore: Math.max(countingData.highScore ?? 0, countingData.lastNumber + 1)
    });
    await this.guild.updateDB(
      'channelMinigames.countingHighScore',
      Math.max(this.guild.db.channelMinigames.countingHighScore ?? 0, countingData.lastNumber + 1)
    );

    return this.react('✅');
  }

  void this.react('❌');
  if (!countingData.lastNumber) return;

  await this.guild.deleteDB(`channelMinigames.counting.${this.channel.id}.lastNumber`);
  await this.guild.deleteDB(`channelMinigames.counting.${this.channel.id}.lastAuthor`);

  return this.reply(
    this.client.i18n.__(
      { locale: this.guild.localeCode }, 'events.message.counting.error',
      {
        lastNumber: bold(countingData.lastNumber), channelHighScore: bold(countingData.highScore ?? 0),
        guildHighscore: bold(this.guild.db.channelMinigames?.countingHighScore ?? 0)
      }
    )
    + '\n' + bold(this.client.i18n.__(
      { locale: this.guild.localeCode },
      countingData.lastAuthor == this.user.id ? 'events.message.counting.sameUserTwice' : 'events.message.counting.wrongNumber'
    ))
  );
}

/** @this {Message<true>} */
async function handleWordchain() {
  const wordchainData = this.guild.db.channelMinigames?.wordchain?.[this.channel.id];
  if (!wordchainData) return;

  const
    firstWord = this.originalContent.split(/\s+/)[0].toLowerCase(),
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
      this.client.i18n.__(
        { locale: this.guild.localeCode }, 'events.message.wordchain.error', { lastChar: bold(lastWordChar), count: bold(wordchainData.chainedWords) }
      )
      + '\n' + bold(this.client.i18n.__({ locale: this.guild.localeCode }, msgId))
    );
  }
}

/**
 * @this {Message<true>}
 * @param {string} cleanMsg */
async function handleWordcounter(cleanMsg) {
  /* eslint-disable-next-line regexp/no-super-linear-move -- char amount is limited to 4000 */
  const wordCount = cleanMsg.match(/\p{L}+['\u2018\u2019\uFF07]?\p{L}+/gu).length; // Matches letter(s) that can have apostrophes in them

  const dbPromises = [];
  if (this.guild.db.wordCounter?.enabled) {
    const { wordCounter } = this.guild.db;
    const memberConter = wordCounter.members[this.user.id];

    dbPromises.push(
      this.guild.updateDB('wordCounter.sum', wordCounter.sum + wordCount),
      this.guild.updateDB(`wordCounter.channels.${this.channel.id}`, (wordCounter.channels[this.channel.id] ?? 0) + wordCount),
      this.guild.updateDB(`wordCounter.members.${this.user.id}.sum`, (memberConter?.sum ?? 0) + wordCount),
      this.guild.updateDB(
        `wordCounter.members.${this.user.id}.channels.${this.channel.id}`,
        (memberConter?.channels[this.channel.id] ?? 0) + wordCount
      )
    );
  }

  if (this.user.db.wordCounter?.enabled) {
    const { wordCounter } = this.user.db;
    const guildCounter = wordCounter.guilds[this.guild.id];

    dbPromises.push(
      this.user.updateDB('wordCounter.sum', wordCounter.sum + wordCount),
      this.user.updateDB(`wordCounter.guilds.${this.guild.id}.sum`, (guildCounter?.sum ?? 0) + wordCount),
      this.user.updateDB(
        `wordCounter.guilds.${this.guild.id}.channels.${this.channel.id}`,
        (guildCounter?.channels[this.channel.id] ?? 0) + wordCount
      )
    );
  }

  return Promise.allSettled(dbPromises);
}

/**
 * @type {import('.').runMessages}
 * @this {ThisParameterType<import('.').runMessages>} */
function runMessages() {
  if (this.originalContent.includes(this.client.user.id) && !cooldowns.call(this, 'botMentionReaction', { user: MESSAGES_COOLDOWN }))
    void this.react('👀');

  if (this.client.botType == 'dev') return this;

  if (this.guild.db.triggers) replyToTriggers.call(this);
  if (Number(this.originalContent)) void handleCounting.call(this);
  if (this.originalContent.length > WORDCOUNT_MIN_CHARS) {
    // Removes emoji, timestamp, command, member and channel mentions
    const cleanMsg = this.content.replaceAll(/<[#/:@t]:?(?:[\s\w]+:)?(?:\w|\d+)>/g, '');
    if (cleanMsg.length > WORDCOUNT_MIN_CHARS) void handleWordcounter.call(this, cleanMsg);
  }

  /* Regex to match any letter from any language
     (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes) */
  else if (/^\p{L}+$/u.test(this.originalContent)) void handleWordchain.call(this);
  if (!this.originalContent.toLowerCase().includes('--afkignore') && !(this.originalContent.startsWith('(') && this.originalContent.endsWith(')')))
    void removeAfkStatus.call(this);
  if (!cooldowns.call(this, 'afkMsg', { channel: secToMs(10), user: secToMs(10) })) void sendAfkMessages.call(this);

  return this;
}