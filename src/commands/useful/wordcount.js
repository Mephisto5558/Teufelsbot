/** @import { MessageReference, GuildTextBasedChannel } from 'discord.js' */

const
  { SnowflakeUtil, bold } = require('discord.js'),
  { AllContexts, Command, CommandType, CooldownType, OptionType, isSlash } = require('@mephisto5558/command');

/**
 * @param {Client} client
 * @param {MessageReference} reference */
function getMessageFromReference(client, reference = {}) {
  /** @type {GuildTextBasedChannel | undefined} */
  const channel = client.guilds.cache.get(reference.guildId)?.channels.cache.get(reference.channelId);
  return channel?.messages.cache.get(reference.messageId);
}

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '1s' },
  contexts: AllContexts,
  options: [
    {
      name: 'message_id',
      type: OptionType.String,
      autocompleteOptions() { return this.channel.messages.cache.filter(e => e.content).keys().toArray(); }
    },
    { name: 'message', type: OptionType.String }
  ],

  async run(lang) {
    let msgId = this.options?.getString('message_id') ?? this.args?.[0];
    try { SnowflakeUtil.deconstruct(msgId); }
    catch { msgId = undefined; }

    const msg = msgId
      ? await this.channel.messages.fetch(msgId).catch(() => { /* empty */ })
        /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional - `this.content` can be an empty string */
      : { content: this.options?.getString('message') ?? (this.content || getMessageFromReference(this.client, this.reference)?.content) };

    if (!msg) return this.customReply(lang('notFound'));
    if (!msg.content) return this.customReply(lang('noContent'));

    const match = msg.content.match(/[\p{P}\p{Z}]+/gu);

    if (msgId && isSlash(this)) void this.deleteReply();
    return this.channel.send({
      content: lang('words', bold(match ? match.length + 1 : 0)),
      reply: { messageReference: msgId }
    });
  }
});