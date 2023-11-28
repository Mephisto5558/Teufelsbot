const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, Constants } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'editmessage',
  permissions: { user: ['ManageMessages'] },
  cooldowns: { user: 5000 },
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.TextBasedChannelTypes,
      required: true
    },
    {
      name: 'message_id',
      type: 'String',
      required: true,
    },
    { name: 'remove_attachments', type: 'Boolean' }
  ],

  /**@this GuildInteraction*/
  run: async function (lang) {
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
      msg = await this.options.getChannel('channel').messages.fetch(this.options.getString('message_id')).catch(() => { }),
      clear = this.options.getBoolean('remove_attachments');

    if (!msg) return this.reply({ content: lang('notFound'), ephemeral: true });
    if (msg.author.id != this.client.user.id) return this.reply({ content: lang('notBotMessage'), ephemeral: true });
    if (!msg.editable) return this.reply({ content: lang('cannotEdit'), ephemeral: true });

    this.showModal(modal);
    const modalInteraction = await this.awaitModalSubmit({ filter: i => i.customId == 'newContent_modal', time: 6e5 }).catch(() => { });
    if (!modalInteraction) return this.reply({ content: lang('timedout'), ephemeral: true });

    await modalInteraction.deferReply({ ephemeral: true });
    const content = modalInteraction.fields.getTextInputValue('newContent_text');
    let json;

    try {
      json = JSON.parse(content);
      if (!Object.keys(json).length) return modalInteraction.editReply(lang('emptyJson'));

      if (json.description !== undefined) json = { embeds: [json] };
      else if (json.every?.(e => e.description !== undefined)) json = { embeds: json };
      json.content.length = 2000;

      await msg.edit(clear ? { content: null, embeds: [], attachments: [], files: [], components: [], ...json } : json);
    }
    catch (err) { if (!(err instanceof SyntaxError)) return modalInteraction.editReply(lang('error', err.message)); }

    if (!json) await msg.edit(clear ? { content: content.substring(0, 2001), embeds: [], attachments: [], files: [], components: [] } : content.substring(0, 2001));

    return modalInteraction.editReply(lang('success', msg.url));
  }
};