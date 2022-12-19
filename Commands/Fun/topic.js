//Credits for many of the response messages goes to the Lawliet Bot: https://github.com/Aninoss/lawliet-bot/tree/master/src/main/jib/data/resources
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'topic',
  cooldowns: { user: 500 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true, beta: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription'),
      footer: { text: this.member.displayName, iconURL: this.member.displayAvatarURL() }
    }).setColor('Random');

    this.customReply({ embeds: [embed] });
  }
};