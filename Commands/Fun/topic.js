// Credit for many of the response messages goes to the Lawliet Bot: `https://github.com/Aninoss/lawliet-bot/tree/master/src/main/jib/data/resources`.
const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  dmPermission: true,

  async run(lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription'),
        footer: { text: this.user.tag, iconURL: this.member.displayAvatarURL() }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: this.commandName,
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
});