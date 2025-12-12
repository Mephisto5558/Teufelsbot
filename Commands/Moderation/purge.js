/**
 * @import { GuildTextBasedChannel } from 'discord.js'
 * @import purge from './purge' */

const
  { Collection, Constants, Message } = require('discord.js'),
  {
    getTargetChannel, DiscordAPIErrorCodes, timeFormatter: { msInSecond }, constants: { bulkDeleteMaxMessageAmt, maxPercentage }
  } = require('#Utils'),

  maxMsgsToFetch = 100,
  maxAllowedPurgeAmt = 1000,
  bulkDeleteSleepTime = 2000,

  adRegex = new RegExp(
    String.raw`(?:(?=discord)(?<!support\.)(?:discord(?:app)?[\W_]*(?:com|gg|io|link|me|net|plus)\/|`
    + String.raw`(?<=\w\.)\w+\/)(?=.)|watchanimeattheoffice[\W_]*com)(?!\/?(?:attachments|channels)\/)`
    + String.raw`|(?:dsc|invite)[\W_]*gg|disboard[\W_]*org`, 'i'
  ),

  /** @type {(options: Record<string, string | number | boolean>) => boolean} */
  filterOptionsExist = options => Object.keys(options).some(e => e != 'amount' && e != 'channel'),

  /** @type {Record<string, (msg: Message<true>) => boolean>} */
  filterCheck = {
    text: msg => !!msg.content.length,
    embeds: msg => !!msg.embeds.length,
    mentions: msg => !!msg.mentions.users.size,
    images: msg => msg.attachments.some(e => e.contentType.includes('image')),
    /* eslint-disable-next-line camelcase -- option name for better user-readability */
    server_ads: msg => adRegex.test(msg.content) || msg.embeds.some(e => adRegex.test(e.description))
  };

/** @type {purge['shouldDeleteMsg']} */
function shouldDeleteMsg(msg, options) {
  const

    /** @type {purge['check']} */
    check = (fn, option) => !option
      || msg.content.toLowerCase()[fn](option.toLowerCase())
      || msg.embeds.some(e => !!e.description?.toLowerCase()[fn](option.toLowerCase())),
    checkCaps = () => !('caps_percentage' in options && options.caps_percentage > 0)
      || msg.content.replaceAll(/[^A-Z]/g, '').length / msg.content.length * maxPercentage >= options.caps_percentage
      || msg.embeds.some(e => e.description?.replaceAll(/[^A-Z]/g, '').length / (e.description?.length ?? 0) * maxPercentage
        >= options.caps_percentage)
      || !msg.content && !msg.embeds.some(e => !!e.description),
    bool = msg.bulkDeletable && (!!options.remove_pinned || !msg.pinned),
    userType = msg.user.bot ? 'bot' : 'human';

  if (!filterOptionsExist(options)) return bool;

  /* eslint-disable-next-line sonarjs/expression-complexity -- good enough readability */
  return bool
    && (!('member' in options) || msg.user.id == options.member.id)
    && (!('user_type' in options) || options.user_type == userType)
    && (!('only_containing' in options) || filterCheck[options.only_containing](msg))
    && checkCaps()
    && check('includes', options.contains) && !check('includes', options.does_not_contain)
    && check('startsWith', options.starts_with) && !check('startsWith', options.not_starts_with)
    && check('endsWith', options.ends_with) && !check('endsWith', options.not_ends_with);
}

const maxMsgs = 250;

/**
 * @param {Message['channel']} channel
 * @param {string?} before
 * @param {string?} after
 * @param {number?} limit */
async function fetchMsgs(channel, before, after, limit = maxMsgs) {
  const options = { limit: Math.min(limit, maxMsgsToFetch), before, after };

  let
    lastId = channel.lastMessageId,

    /** @type {Collection<Snowflake, Message>} */
    collection = new Collection();

  while (collection.size < limit) {
    if (lastId) options.before = lastId;

    const messages = await channel.messages.fetch(options);
    if (!messages.size) break;

    /* eslint-disable-next-line unicorn/prefer-spread -- false positive: Collection extends Map, not Array */
    collection = collection.concat(messages);
    lastId = messages.at(-1)?.id;
    options.limit = Math.min(limit - collection.size, maxMsgsToFetch);
  }

  return collection;
}

/**
 * @this {ThisParameterType<NonNullable<command<'both'>['run']>>}
 * @param {number | undefined} amount
 * @param {purge.shouldDeleteMsgOptions} options
 * @param {boolean} exists
 * @param {lang} lang */
function checkParams(amount, options, exists, lang) {
  if (!amount) return void this.customReply(Number.isNaN(amount) ? lang('invalidNumber') : lang('noNumber'));
  if (options.before_message && options.after_message) return void this.customReply(lang('beforeAndAfter'));

  if (
  /* eslint-disable-next-line sonarjs/expression-complexity -- clear logic imo */
    exists && (
      options.does_not_contain && options.contains?.includes(options.does_not_contain)
      || options.contains && options.does_not_contain?.includes(options.contains)
      || options.starts_with && options.starts_with == options.not_starts_with
      || options.ends_with && options.ends_with == options.not_ends_with
    )
  ) return void this.customReply(lang('paramsExcludeOther'));

  return true;
}

/** @type {command<'both'>} */
module.exports = {
  aliases: { prefix: ['clear'] },
  permissions: { client: ['ManageMessages', 'ReadMessageHistory'], user: ['ManageMessages'] },
  cooldowns: { guild: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'amount',
      type: 'Integer',
      minValue: 1,
      maxValue: maxAllowedPurgeAmt,
      required: true
    },
    {
      name: 'only_containing',
      type: 'String',
      choices: ['text', 'mentions', 'server_ads', 'images', 'embeds']
    },
    { name: 'member', type: 'User' },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'remove_pinned', type: 'Boolean' },
    {
      name: 'caps_percentage',
      type: 'Number',
      minValue: 1,
      maxValue: maxPercentage
    },
    { name: 'contains', type: 'String' },
    { name: 'does_not_contain', type: 'String' },
    { name: 'starts_with', type: 'String' },
    { name: 'not_starts_with', type: 'String' },
    { name: 'ends_with', type: 'String' },
    { name: 'not_ends_with', type: 'String' },
    {
      name: 'user_type',
      type: 'String',
      choices: ['bot', 'human']
    },
    { name: 'before_message', type: 'String' },
    { name: 'after_message', type: 'String' }
  ],

  async run(lang) {
    const
      amount = this.options?.getInteger('amount', true) ?? Number.parseInt(this.args[0]).limit({ min: 0, max: maxAllowedPurgeAmt }),

      /** @type {GuildTextBasedChannel} */
      channel = getTargetChannel(this, { returnSelf: true }),

      /** @type {purge.shouldDeleteMsgOptions} */
      options = Object.fromEntries(this.options?.data.map(e => [e.name, e.value]) ?? []);

    if (this instanceof Message) {
      try { await this.delete(); }
      catch (err) {
        if (err.code != DiscordAPIErrorCodes.UnknownMessage) throw err;
      }
    }

    const exists = filterOptionsExist(options);
    if (!checkParams.call(this, amount, options, exists, lang)) return;

    const messages = (await fetchMsgs(channel, exists ? options.before_message : undefined, exists ? options.after_message : undefined, amount))
      .filter(e => shouldDeleteMsg(e, options))
      .keys()
      .toArray();

    if (!messages.length) return this.customReply(lang('noneFound'));

    let count = 0;
    for (let i = 0; i < messages.length; i += bulkDeleteMaxMessageAmt) {
      count += (await channel.bulkDelete(messages.slice(i, i + bulkDeleteMaxMessageAmt))).size;
      if (messages[i + bulkDeleteMaxMessageAmt]) await sleep(bulkDeleteSleepTime);
    }

    return this.customReply(lang('success', { count, all: messages.length }), msInSecond * 10);
  }
};