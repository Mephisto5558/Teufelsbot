const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**@type {command}*/
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
          type: 'String',
          choices: Object.keys(ButtonStyle).filter(Number).map(String),
          required: true
        },
        { name: 'emoji', type: 'String' },
        {
          name: 'label',
          type: 'String',
          maxLength: 80
        },
        {
          name: 'url',
          type: 'String',
          maxLength: 1000
        },
        { name: 'new_row', type: 'Boolean' },
        { name: 'content', type: 'String' },
        { name: 'message_id', type: 'String' }
      ]
    }
  ],

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      custom = this.options.getString('json'),
      content = this.options.getString('content') ?? undefined,
      isLink = this.options.getString('style') == ButtonStyle.Link;

    let
      msg = this.options.getString('message_id'),
      url = this.options.getString('url');

    if (isLink) {
      if (!/^((discord|https?):\/\/)?[\w.-]+\.[a-z]+/i.test(url)) return this.editReply(lang('invalidURL'));
      if (!url.startsWith('http') && !url.startsWith('discord')) url = `https://${url}`;
    }

    if (msg) {
      try { msg = await this.channel.messages.fetch(msg); }
      catch { return this.editReply(lang('msgNotFound')); }

      if (msg.user.id != this.client.user.id) return this.editReply(lang('botIsNotAuthor'));
      if (msg.components[4] && this.options.getBoolean('new_row') || msg.components[4]?.components?.[4]) return this.editReply(lang('buttonLimit'));
    }

    try {
      const button = new ButtonBuilder(custom ? JSON.parse(custom) : {
        style: parseInt(this.options.getString('style')),
        label: this.options.getString('label'),
        emoji: this.options.getString('emoji'),
        url
      });

      if (!isLink) button.setCustomId(`buttonCommandButton_${Date.now()}`);

      const components = new Array(...(msg?.components || []));

      if (!msg?.components?.length || this.options.getBoolean('new_row') || !components[components.length]?.components.push(button))
        components.push(new ActionRowBuilder({ components: [button] }));

      await (msg ? msg.edit({ content, components }) : this.channel.send({ content, components }));

      delete button.data.custom_id;
      return this.editReply(custom ? lang('successJSON') : lang('success', JSON.stringify(button.data.filterEmpty())));
    }
    catch (err) { return this.editReply(lang('invalidOption', err.message)); }
  }
};