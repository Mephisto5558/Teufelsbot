const { ChatInputCommandInteraction } = require('discord.js');

/** @type {command<'both'>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'message_id',
      type: 'String',
      autocompleteOptions() { return [...this.channel.messages.cache.keys()]; }
    },
    { name: 'message', type: 'String' }
  ],

  async run(lang) {
    const
      msgId = this.options?.getString('message_id') ?? this.args?.[0],
      msg = msgId ? await this.channel.messages.fetch(msgId).catch(() => { /* empty*/ }) : { content: this.options?.getString('message') };

    if (!msg) return this.customReply(lang('notFound'));
    if (!msg.content) return this.customReply(lang('noContent'));

    if (msgId && this instanceof ChatInputCommandInteraction) void this.deleteReply();
    return this.channel.send({ content: lang('words', msg.content.match(/[\p{P}\p{Z}]+/gu)?.length ?? 0), reply: { messageReference: msgId } });
  }
};