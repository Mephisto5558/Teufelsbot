const
  {
    ActionRowBuilder, Constants, DiscordjsErrorCodes, MessageFlags, ModalBuilder,
    TextInputBuilder, TextInputStyle, codeBlock, hyperlink
  } = require('discord.js'),
  { DiscordAPIErrorCodes, constants: { messageMaxLength }, timeFormatter: { msInSecond, secsInMinute }, toMs: { secToMs } } = require('#Utils'),

  MODALSUBMIT_TIMEOUT = msInSecond * secsInMinute / 2; // 30s

/** @type {command<'slash'>} */
module.exports = {
  permissions: { user: ['ManageMessages'] },
  cooldowns: { user: secToMs(5) }, /* eslint-disable-line @typescript-eslint/no-magic-numbers */
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes,
      required: true
    },
    {
      name: 'message_id',
      type: 'String',
      required: true
    },
    { name: 'remove_attachments', type: 'Boolean' }
  ],

  async run(lang) {
    const
      modal = new ModalBuilder({
        title: lang('modalTitle'),
        customId: 'newContent_modal',
        components: [new ActionRowBuilder({
          components: [new TextInputBuilder({
            customId: 'newContent_text',
            label: lang('textInputLabel'),
            placeholder: lang('textInputPlaceholder'),
            style: TextInputStyle.Paragraph,
            required: true
          })]
        })]
      }),
      clear = this.options.getBoolean('remove_attachments');

    let msg, modalInteraction;
    try {
      const /** @type {Snowflake} */ msgId = this.options.getString('message_id', true);
      msg = await this.options.getChannel('channel', true, Constants.GuildTextBasedChannelTypes).messages.fetch(msgId);
    }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.UnknownMessage) throw err;
      return this.reply({ content: lang('notFound'), flags: MessageFlags.Ephemeral });
    }

    if (msg.author.id != this.client.user.id) return this.reply({ content: lang('notBotMessage'), flags: MessageFlags.Ephemeral });
    if (!msg.editable) return this.reply({ content: lang('cannotEdit'), flags: MessageFlags.Ephemeral });

    void this.showModal(modal);
    try { modalInteraction = await this.awaitModalSubmit({ filter: i => i.customId == 'newContent_modal', time: MODALSUBMIT_TIMEOUT }); }
    catch (err) { if (err.code != DiscordjsErrorCodes.InteractionCollectorError) throw err; }

    if (!modalInteraction) return this.reply({ content: lang('global.menuTimedOut'), flags: MessageFlags.Ephemeral });

    await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });
    const content = modalInteraction.fields.getTextInputValue('newContent_text');

    let json;

    try {
      json = JSON.parse(content);
      if (typeof json != 'object' || !json) throw new SyntaxError(`Invalid JSON. Expected object | array, got ${typeof json}`);
      if (!json.__count__) return void modalInteraction.editReply(lang('emptyJson'));

      if ('description' in json) json = { embeds: json };
      else if (Array.isArray(json)) {
        if (!json.every(e => 'description' in e)) throw new SyntaxError('Invalid JSON. Expected array of embeds.');
        json = { embeds: json };
      }

      if ('content' in json) json.content.length = messageMaxLength;

      await msg.edit(clear ? { content: '', embeds: [], attachments: [], files: [], components: [], ...json } : json);
    }
    catch (err) {
      if (!(err instanceof SyntaxError) || err.message.includes('JSON'))
        return modalInteraction.editReply(lang('error', codeBlock(err.message)));
    }

    if (!json) {
      await msg.edit(
        clear
          ? { content: content.slice(0, messageMaxLength + 1), embeds: [], attachments: [], files: [], components: [] }
          : content.slice(0, messageMaxLength)
      );
    }

    return modalInteraction.editReply(lang('success', hyperlink(lang('link'), msg.url)));
  }
};