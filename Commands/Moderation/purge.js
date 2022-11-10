const
  { Message, CommandInteraction, Constants } = require('discord.js'),
  notNullEqual = (str1, str2) => str1 && str1 == str2,
  adRegex = str => /((?=discord)(?<!support\.)(discord(?:app)?[\W_]*(com|gg|me|net|io|plus|link)\/|(?<=\w\.)\w+\/)(?=.)|watchanimeattheoffice[\W_]*com)(?!\/?(attachments|channels)\/)|(invite|dsc)[\W_]*gg|disboard[\W_]*org/gi.test(str), //filters discord invites, invite.gg, dsc.gg, disboard.org links
  filterCheck = (msg, type) => {
    switch (type) {
      case 'text': if (msg.content.length) return; break;
      case 'embeds': if (msg.embeds?.length) return; break;
      case 'mentions': if (msg.mentions.users.size) return; break;
      case 'images': if (msg.attachments?.find(e => e.contentType.includes('image')).length) return; break;
      case 'server_ads': if (adRegex(msg.content) || msg.embeds?.find(e => adRegex(e.description))) return; break;
    }
    return true;
  };

/**@returns {undefined|null|boolean}if the messages should NOT be removed*/
function checkMsg(msg, getStr) {
  const options = this.options.data.map(e => e.name);
  if (
    (options.includes('member') && msg.user.id != this.options.getUser('member').id) ||
    (options.includes('user_type') && (msg.user.bot && getStr('user_type') == 'human' || !msg.user.bot && getStr('user_type') == 'bot')) ||
    (options.includes('only_containing') && filterCheck(msg, getStr('only_containing'))) ||
    (options.includes('caps_percentage') && (msg.content.replace(/[a-z]/g, '').length / msg.content.length * 100 < this.options.getNumber('caps_percentage'))) ||
    (options.includes('contains') && (!msg.content.includes(getStr('contains')) && !msg.embeds?.find(e => e.description.includes(getStr('contains'))))) ||
    (options.includes('does_not_contain') && (msg.content.includes(getStr('does_not_contain')) || msg.embeds?.find(e => e.description.includes(getStr('does_not_contain'))))) ||
    (options.includes('starts_with') && (!msg.content.statsWith(getStr('starts_with')) && !msg.embeds?.find(e => e.description.startsWith(getStr('starts_with'))))) ||
    (options.includes('not_starts_with') && (msg.content.statsWith(getStr('not_starts_with')) || msg.embeds?.find(e => e.description.startsWith(getStr('not_starts_with'))))) ||
    (options.includes('ends_with') && (!msg.content.endsWith(getStr('ends_with')) && !msg.embeds?.find(e => e.description.endsWith(getStr('ends_with'))))) ||
    (options.includes('not_ends_with') && (msg.content.endsWith(getStr('not_ends_with')) || msg.embeds?.find(e => e.description.endsWith(getStr('not_ends_with')))))
  ) return;
  return this.options.getBoolean('remove_pinned') || !msg.pinned;
}

module.exports = {
  name: 'purge',
  aliases: { prefix: ['clear'] },
  permissions: { client: ['ManageMessages'], user: ['ManageMessages'] },
  cooldowns: { guild: 1000 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'amount',
      type: 'Number',
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
      channelTypes: Constants.TextBasedChannelTypes
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
    { name: 'after_message', type: 'String' },
  ],

  run: async function (lang) {
    const
      amount = parseInt(this.options?.getNumber('amount') || this.args?.[0]).limit({ min: 0, max: 1000 }),
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      getStr = option => this.options?.getString(option);

    let messages, deleted = 0;

    if (!amount) return this.customReply(isNaN(amount) ? lang('invalidNumber') : lang('noNumber'));
    if (this instanceof Message) await this.delete();

    if (this.options?.data.filter(e => e.name != 'amount' && e.name != 'channel').length) {
      if (getStr('contains')?.includes(getStr('does_not_contain')) || getStr('does_not_contains')?.includes(getStr('contains')) || notNullEqual(getStr('starts_with'), getStr('not_starts_with')) || notNullEqual(getStr('ends_with'), getStr('not_ends_with')))
        return this.editReply(lang('paramExcludesOther'));

      messages = [...(await channel.messages.fetch({ limit: amount, before: getStr('before_message'), after: getStr('after_message') }))?.filter(e => checkMsg.call(this, e, getStr)).keys() || []];

      if (!messages.length) return this.editReply(lang('noneFound'));
    }

    for (let i = 0; i < (messages?.length ?? amount); i += 100) {
      deleted += (await channel.bulkDelete(messages?.slice(i, i + 100) ?? (amount - i).limit({ max: 100 }), true))?.size ?? 0;
      if (messages?.[i + 1] ?? amount - i > 0) await sleep(2000);
    }

    if (this instanceof CommandInteraction) this.editReply(lang('success', { count: deleted, all: messages?.length ?? amount }));
  }
};