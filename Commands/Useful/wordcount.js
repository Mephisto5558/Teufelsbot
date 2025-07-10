const
  { ChatInputCommandInteraction, bold } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter;

/**
 * @param {Client} client
 * @param {{ guildId: Snowflake, channelId: Snowflake, messageId: Snowflake }} reference
 * @returns {Message<true> | undefined} */
const getMessageFromReference = (client, reference = {}) => client.guilds.cache.get(reference.guildId)?.channels.cache.get(reference.channelId)?.messages.cache.get(reference.messageId);

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
    const
      msgId = this.options?.getString('message_id') ?? this.args?.[0],
      msg = msgId
        ? await this.channel.messages.fetch(msgId).catch(() => { /* empty */ })
        /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional - `this.content` can be an empty string */
        : { content: this.options?.getString('message') ?? (this.content || getMessageFromReference(this.client, this.reference)?.content) };

    if (!msg) return this.customReply(lang('notFound'));
    if (!msg.content) return this.customReply(lang('noContent'));

    if (msgId && this instanceof ChatInputCommandInteraction) void this.deleteReply();
    return this.channel.send({ content: lang('words', bold(msg.content.match(/[\p{P}\p{Z}]+/gu)?.length ?? 0)), reply: { messageReference: msgId } });
  }
};