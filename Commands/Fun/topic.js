//Credits for many of the response messages goes to the Lawliet Bot: https://github.com/Aninoss/lawliet-bot/tree/master/src/main/jib/data/resources
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'topic',
  cooldowns: { user: 10000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription'),
        footer: { text: this.user.tag, iconURL: this.member.displayAvatarURL() }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: 'topic',
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};