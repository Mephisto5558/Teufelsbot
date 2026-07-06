import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { AllContexts, Command, CommandType, CooldownType, OptionType, isMessage } from '@mephisto5558/command';
import { chatgpt_fetchAPI as fetchAPI } from '#utils/componentHandler';
import { messageMaxLength } from '#utils/constants.ts';

export default new Command({
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