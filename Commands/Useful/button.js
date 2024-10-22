const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError } = require('discord.js'),
  { DiscordApiErrorCodes } = require('#Utils');

module.exports = new SlashCommand({
  cooldowns: { user: 500 },
  ephemeralDefer: true,
  options: [
    new CommandOption({
      name: 'json',
      type: 'Subcommand',
      options: [new CommandOption({ name: 'json', type: 'String' })]
    }),
    new CommandOption({
      name: 'custom',
      type: 'Subcommand',
      options: [
        new CommandOption({
          name: 'style',
          type: 'String',
          choices: Object.keys(ButtonStyle).filter(Number).map(String),
          required: true
        }),
        new CommandOption({ name: 'emoji', type: 'String' }),
        new CommandOption({
          name: 'label',
          type: 'String',
          maxLength: 80
        }),
        new CommandOption({
          name: 'url',
          type: 'String',
          maxLength: 1000
        }),
        new CommandOption({ name: 'new_row', type: 'Boolean' }),
        new CommandOption({ name: 'content', type: 'String' }),
        new CommandOption({ name: 'message_id', type: 'String' })
      ]
    })
  ],

  async run(lang) {
    const
      custom = this.options.getString('json'),
      content = this.options.getString('content') ?? undefined,
      isLink = this.options.getString('style', true) == ButtonStyle.Link;

    let
      msg = this.options.getString('message_id'),
      url = this.options.getString('url');

    if (isLink) {
      if (!/^(?:(?:discord|https?):\/\/)?[\w\-.]+\.[a-z]+/i.test(url)) return this.editReply(lang('invalidURL'));
      if (!url.startsWith('http') && !url.startsWith('discord')) url = `https://${url}`;
    }

    if (msg) {
      try { msg = await this.channel.messages.fetch(msg); }
      catch (err) {
        if (err.code != DiscordApiErrorCodes.UnknownMessage) throw err;
        return this.editReply(lang('msgNotFound'));
      }

      if (msg.user.id != this.client.user.id) return this.editReply(lang('botIsNotAuthor'));
      if (msg.components[4] && this.options.getBoolean('new_row') || msg.components[4]?.components?.[4]) return this.editReply(lang('buttonLimit'));
    }

    try {
      const button = new ButtonBuilder(custom
        ? JSON.parse(custom)
        : {
          style: Number.parseInt(this.options.getString('style')),
          label: this.options.getString('label'),
          emoji: this.options.getString('emoji'),
          url
        });

      if (!isLink) button.setCustomId(`buttonCommandButton_${Date.now()}`);

      const components = msg?.components ? [...msg.components] : [];

      if (!msg?.components?.length || this.options.getBoolean('new_row') || !components[components.length]?.components.push(button))
        components.push(new ActionRowBuilder({ components: [button] }));

      await (msg?.edit({ content, components }) ?? this.channel.send({ content, components }));

      delete button.data.custom_id;
      return this.editReply(custom ? lang('successJSON') : lang('success', JSON.stringify(button.data.filterEmpty())));
    }
    catch (err) {
      if (!(err instanceof DiscordAPIError) && !err.message?.includes('JSON at')) throw err;
      return this.editReply(lang('invalidOption', err.message));
    }
  }
});