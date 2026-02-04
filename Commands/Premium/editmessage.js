const
  {
    ActionRowBuilder, Constants,
    DiscordAPIError, DiscordjsErrorCodes, MessageFlags, ModalBuilder,
    TextInputBuilder, TextInputStyle, codeBlock, hyperlink
  } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { DiscordAPIErrorCodes, constants: { messageMaxLength }, toMs: { secToMs } } = require('#Utils'),

  MODALSUBMIT_TIMEOUT = secToMs(30); /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 30s */

/**
 * @this {Interaction<true>}
 * @param {lang} lang */
async function getTargetMessage(lang) {
  let msg;
  try {
    const /** @type {Snowflake} */ msgId = this.options.getString('message_id', true);
    msg = await this.options.getChannel('channel', true, Constants.GuildTextBasedChannelTypes).messages.fetch(msgId);
  }
  catch (err) {
    if (err instanceof DiscordAPIError && [DiscordAPIErrorCodes.UnknownMessage, DiscordAPIErrorCodes.InvalidFormBody].includes(err.code))
      return;

    throw err;
  }

  if (msg.author.id != this.client.user.id) await this.reply({ content: lang('notBotMessage'), flags: MessageFlags.Ephemeral });
  else if (msg.editable) return msg;
  else await this.reply({ content: lang('cannotEdit'), flags: MessageFlags.Ephemeral });
}

/**
 * @this {Interaction<true>}
 * @param {lang} lang */
async function sendModal(lang) {
  const modal = new ModalBuilder({
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
  });

  void this.showModal(modal);

  let modalInteraction;
  try { modalInteraction = await this.awaitModalSubmit({ filter: i => i.customId == 'newContent_modal', time: MODALSUBMIT_TIMEOUT }); }
  catch (err) {
    if (err instanceof DiscordAPIError && err.code == DiscordjsErrorCodes.InteractionCollectorError)
      return;

    throw err;
  }

  await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });
  return modalInteraction;
}

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { user: [Permissions.ManageMessages] },
  cooldowns: { user: '5s' },
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
      clear = this.options.getBoolean('remove_attachments'),
      msg = await getTargetMessage.call(this, lang);

    if (!msg) return this.reply({ content: lang('notFound'), flags: MessageFlags.Ephemeral });

    const modalInteraction = await sendModal.call(this, msg, lang);
    if (!modalInteraction) return this.customReply({ content: lang('global.menuTimedOut'), flags: MessageFlags.Ephemeral });

    const content = modalInteraction.fields.getTextInputValue('newContent_text');

    let json;
    try { json = JSON.parse(content); }
    catch { /** empty */ }

    if (json) {
      try {
        if (typeof json != 'object') throw new SyntaxError(`Invalid JSON. Expected object | array, got ${typeof json}`);
        if (!json.__count__) return void modalInteraction.editReply(lang('emptyJson'));

        if ('description' in json) json = { embeds: [json] };
        else if (Array.isArray(json)) {
          if (!json.every(e => 'description' in e)) throw new SyntaxError('Invalid JSON. Expected array of embeds.');
          json = { embeds: json };
        }

        if ('content' in json) json.content.length = messageMaxLength;

        await msg.edit(clear ? { content: '', embeds: [], attachments: [], files: [], components: [], ...json } : json);
      }
      catch (rawErr) {
        const err = rawErr instanceof Error ? rawErr : new Error(rawErr);

        if (!(err instanceof DiscordAPIError) && !err.message.includes('JSON')) throw err;
        return modalInteraction.editReply(lang('error', codeBlock(err.message)));
      }
    }

    if (!json) {
      await msg.edit(
        clear
          ? { content: content.slice(0, messageMaxLength), embeds: [], attachments: [], files: [], components: [] }
          : content.slice(0, messageMaxLength)
      );
    }

    return modalInteraction.editReply(lang('success', hyperlink(lang('link'), msg.url)));
  }
});