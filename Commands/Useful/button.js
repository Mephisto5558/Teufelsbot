const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const validateURL = url => {
  try { return !!new URL(url); }
  catch (error) { return !!new URL(`https://${url}`); }
};

module.exports = {
  name: 'button',
  cooldowns: { user: 500 },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'json',
      type: 'Subcommand',
      options: [{ name: 'json', type: 'String' }]
    },
    {
      name: 'custom',
      type: 'Subcommand',
      options: [
        {
          name: 'style',
          type: 'Number',
          choices: Object.keys(ButtonStyle).filter(Number),
          required: true
        },
        { name: 'emoji', type: 'String' },
        {
          name: 'label',
          type: 'String',
          maxLength: 80
        },
        { name: 'url', type: 'String' },
        { name: 'new_row', type: 'Boolean' },
        { name: 'content', type: 'String' },
        { name: 'message_id', type: 'String' }
      ]
    }
  ],

  run: async function (lang) {
    const
      custom = this.options.getString('json'),
      content = this.options.getString('content') || undefined,
      isLink = this.options.getNumber('style') == ButtonStyle.Link;

    let
      msg = this.options.getString('message_id'),
      url = isLink ? validateURL(this.options.getString('url')) : undefined,
      button;

    if (url === false) return this.editReply(lang('invalidURL'));
    if (msg) {
      try { msg = await this.channel.messages.fetch(msg); }
      catch { return this.editReply(lang('msgNotFound')); }
      if (msg.user.id != this.client.user.id) return this.editReply(lang('botIsNotAuthor'));
      if (msg.components[4]?.components?.[4] || (msg.components[4] && this.options.getBoolean('new_row'))) return this.editReply(lang('buttonLimit'));
    }

    try {
      button = new ButtonBuilder(custom ? JSON.parse(custom) : {
        style: this.options.getNumber('style'),
        label: this.options.getString('label'),
        emoji: this.options.getString('emoji'),
        url
      });

      if (!isLink) button.setCustomId(`buttonCommandButton_${Date.now()}`);

      const components = new Array(...(msg?.components || []));

      if (!msg?.components?.length || this.options.getBoolean('new_row') || !components[components.length]?.components.push(button))
        components.push(new ActionRowBuilder({ components: [button] }));

      if (msg) await msg.edit({ content, components });
      else await this.channel.send({ content, components });
    }
    catch (err) { return this.editReply(lang('invalidOption', err.message)); }

    if (custom) return this.editReply(lang('successJSON'));

    delete button.data.custom_id;
    this.editReply(lang('success', JSON.stringify(button.data.filterEmpty())));
  }
};