const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require('discord.js'),
  { constants: { messageMaxLength }, timeFormatter: { msInSecond } } = require('#Utils'),
  fetchAPI = require('#Utils/componentHandler').chatgpt_fetchAPI;

/** @type {command<'both', false>} */
module.exports = {
  aliases: { prefix: ['gpt'] },
  cooldowns: { user: msInSecond * 2 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  premium: true,
  options: [{
    name: 'message',
    type: 'String',
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
};