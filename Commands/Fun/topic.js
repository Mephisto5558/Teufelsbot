// Credit for many of the response messages goes to the Lawliet Bot: https://github.com/Aninoss/lawliet-bot/tree/master/src/main/jib/data/resources
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/** @type {command<'both', false>}*/
module.exports = {
  cooldowns: { channel: 1e4 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
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