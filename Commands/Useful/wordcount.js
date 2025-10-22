const
  { ChatInputCommandInteraction, SnowflakeUtil, bold } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter;

/**
 * @param {Client} client
 * @param {import('discord.js').MessageReference} reference */
function getMessageFromReference(client, reference = {}) {
  /** @type {import('discord.js').GuildTextBasedChannel | undefined} */
  const channel = client.guilds.cache.get(reference.guildId)?.channels.cache.get(reference.channelId);
  return channel?.messages.cache.get(reference.messageId);
}

/** @type {command<'both'>} */
module.exports = {
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'message_id',
      type: 'String',
      autocompleteOptions() { return [...this.channel.messages.cache.filter(e => e.content).keys()]; }
    },
    { name: 'message', type: 'String' }
  ],

  async run(lang) {
    let msgId = this.options?.getString('message_id') ?? this.args?.[0];
    try { SnowflakeUtil.decode(msgId); }
    catch { msgId = undefined; }

    const msg = msgId
      ? await this.channel.messages.fetch(msgId).catch(() => { /* empty */ })
        /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional - `this.content` can be an empty string */
      : { content: this.options?.getString('message') ?? (this.content || getMessageFromReference(this.client, this.reference)?.content) };

    if (!msg) return this.customReply(lang('notFound'));
    if (!msg.content) return this.customReply(lang('noContent'));

    const match = msg.content.match(/[\p{P}\p{Z}]+/gu);

    if (msgId && this instanceof ChatInputCommandInteraction) void this.deleteReply();
    return this.channel.send({
      content: lang('words', bold(match ? match.length + 1 : 0)),
      reply: { messageReference: msgId }
    });
  }
};