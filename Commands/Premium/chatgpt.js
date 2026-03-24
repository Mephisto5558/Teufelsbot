const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require('discord.js'),
  { Command, OptionType, CommandType } = require('@mephisto5558/command'),
  { constants: { messageMaxLength } } = require('#Utils'),
  fetchAPI = require('#Utils/componentHandler').chatgpt_fetchAPI;

module.exports = new Command({
  types: [CommandType.slash, CommandType.prefix],
  aliases: { [CommandType.prefix]: ['gpt'] },
  cooldowns: { user: '2s' },
  dmPermission: true,
  premium: true,
  options: [{
    name: 'message',
    type: OptionType.String,
    maxLength: messageMaxLength,
    required: true
  }],

  async run(lang) {
    if (this instanceof Message && 'sendTyping' in this.channel) void this.channel.sendTyping();

    const
      [content, model] = await fetchAPI.call(this, lang),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('regenerate'),
          customId: `chatgpt.${this.user.id}.regenerate.${model}`,
          style: ButtonStyle.Secondary
        })]
      });

    return this.customReply({ content, components: [component] }, undefined, { repliedUser: true });
  }
});