const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { AllContexts, Command, CommandType, CooldownType, OptionType, isMessage } = require('@mephisto5558/command'),
  { constants: { messageMaxLength } } = require('#utils'),
  fetchAPI = require('#utils/componentHandler').chatgpt_fetchAPI;

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['gpt'] },
  cooldowns: { [CooldownType.User]: '2s' },
  contexts: AllContexts,
  premium: true,
  options: [{
    name: 'message',
    type: OptionType.String,
    maxLength: messageMaxLength,
    required: true
  }],

  async run(lang) {
    if (isMessage(this) && 'sendTyping' in this.channel) void this.channel.sendTyping();

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