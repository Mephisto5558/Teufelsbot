const
  { Message, Constants, Collection } = require('discord.js'),
  { getTargetChannel, DiscordAPIErrorCodes } = require('../../Utils'),

  /**
   * @param {string}str
   * filters discord invites, invite.gg, dsc.gg, disboard.org links*/
  /* eslint-disable-next-line @stylistic/max-len */
  adRegex = str => /((?=discord)(?<!support\.)(discord(?:app)?[\W_]*(com|gg|me|net|io|plus|link)\/|(?<=\w\.)\w+\/)(?=.)|watchanimeattheoffice[\W_]*com)(?!\/?(attachments|channels)\/)|(invite|dsc)[\W_]*gg|disboard[\W_]*org/gi.test(str),
  filterOptionsExist = /** @param {Record<string, string | number | boolean | undefined>}options */ options => Object.keys(options).some(e => e != 'amount' && e != 'channel'),

  /** @type {Record<string, (msg: Message<true>) => any>}*/
  filterCheck = {
    text: msg => msg.content.length,
    embeds: msg => msg.embeds?.length,
    mentions: msg => msg.mentions.users.size,
    images: msg => msg.attachments?.some(e => e.contentType.includes('image')),
    /* eslint-disable-next-line camelcase */ // option name
    server_ads: msg => adRegex(msg.content) || msg.embeds?.some(e => adRegex(e.description))
  };

/**
 * @param {Message<true>}msg
 * @param {Record<string, string | number | boolean | undefined>}options*/
function shouldDeleteMsg(msg, options) {
  const
    nHas = option => !(option in options),
    bool = msg.bulkDeletable && (!options.remove_pinned || msg.pinned),
    userType = msg.user.bot ? 'bot' : 'human';

  return !!(filterOptionsExist(options)
    ? bool
    && (nHas('member') || msg.user.id == options.member.id)
    && (nHas('user_type') || options.user_type == userType)
    && (nHas('only_containing') || filterCheck[options.only_containing](msg))
    && (nHas('caps_percentage') || msg.content.replaceAll(/[^A-Z]/g, '').length / msg.content.length * 100 >= options.caps_percentage)
    && (nHas('contains') || msg.content.includes(options.contains) || msg.embeds?.some(e => e.description.includes(options.contains)))
    && (nHas('does_not_contain') || msg.content.includes(options.does_not_contain) || msg.embeds?.some(e => e.description.includes(options.does_not_contain)))
    && (nHas('starts_with') || msg.content.startsWith(options.starts_with) || msg.embeds?.some(e => e.description.startsWith(options.starts_with)))
    && (nHas('not_starts_with') || msg.content.startsWith(options.not_starts_with) || msg.embeds?.some(e => e.description.startsWith(options.not_starts_with)))
    && (nHas('ends_with') || msg.content.endsWith(options.ends_with) || msg.embeds?.some(e => e.description.endsWith(options.ends_with)))
    && (nHas('not_ends_with') || msg.content.endsWith(options.not_ends_with) || msg.embeds?.some(e => e.description.endsWith(options.not_ends_with)))
    : bool);
}

/**
 * @param {Message['channel']}channel
 * @param {number?}limit
 * @param {string?}before
 * @param {string?}after*/
/* eslint-disable-next-line unicorn/no-useless-undefined */
async function fetchMsgs(channel, limit = 250, before = undefined, after = undefined) {
  const options = { limit: Math.min(limit, 100), before, after };

  let
    lastId,
    collection = new Collection();

  while (collection.size < limit) {
    if (lastId) options.before = lastId;

    const messages = await channel.messages.fetch(options);
    if (!messages.size) break;

    /* eslint-disable-next-line unicorn/prefer-spread */ // Collection extends Map, not Array
    collection = collection.concat(messages);
    lastId = messages.last().id;
    options.limit = Math.min(limit - collection.size, 100);
  }

  return collection;
}

/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: ['clear'] },
  permissions: { client: ['ManageMessages', 'ReadMessageHistory'], user: ['ManageMessages'] },
  cooldowns: { guild: 1000 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'amount',
      type: 'Integer',
      minValue: 1,
      maxValue: 1000,
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
      maxValue: 100
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
  ], beta: true,

  run: async function (lang) {
    const
      amount = this.options?.getInteger('amount', true) ?? Number.parseInt(this.args[0]).limit({ min: 0, max: 1000 }),

      /** @type {import('discord.js').GuildTextBasedChannel}*/
      channel = getTargetChannel(this, { returnSelf: true }),
      options = Object.fromEntries(this.options?.data.map(e => [e.name, e.value]) ?? []);

    let messages,
      count = 0;

    if (!amount) return this.customReply(Number.isNaN(amount) ? lang('invalidNumber') : lang('noNumber'));
    if (options.before && options.after) return this.customReply(lang('beforeAndAfter'));

    if (this instanceof Message) {
      try { await this.delete(); }
      catch (err) {
        if (err.code != DiscordAPIErrorCodes.UnknownMessage) throw err;
      }
    }

    if (filterOptionsExist(options)) {
      if (
        options.contains?.includes(options.does_not_contain) || options.does_not_contains?.includes(options.contains)
        || options.starts_with && options.does_not_contain == options.not_starts_with || options.ends_with && options.ends_with == options.not_ends_with
      ) return this.editReply(lang('paramsExcludeOther'));

      messages = await fetchMsgs(channel, amount, options.before, options.after);
    }
    else messages = await fetchMsgs(channel, amount);

    messages = [...messages.filter(e => shouldDeleteMsg(e, options)).keys()];
    if (!messages.length) return this.customReply(lang('noneFound'));

    for (let i = 0; i < messages.length; i += 100) {
      count += (await channel.bulkDelete(messages.slice(i, i + 100)))?.size ?? 0;
      if (messages[i + 100]) await sleep(2000);
    }

    return this.customReply(lang('success', { count, all: messages.length }), 1e4);
  }
};