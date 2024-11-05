const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } = require('discord.js'),
  { secsInMinute } = require('#Utils/timeFormatter.js');

/** @type {command<'both'>}*/
module.exports = {
  cooldowns: { user: 10 * secsInMinute * 1000 }, // 10min
  slashCommand: true,
  prefixCommand: true,

  async run(lang) {
    const
      embed = new EmbedBuilder({
        description: lang('embedDescription'),
        color: Colors.Blurple
      }),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('buttonLabel'),
          emoji: '🖱️', // for some reason, :name: does not work
          customId: 'clickCounter.0',
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};