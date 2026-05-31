// Credit for many of the response messages goes to the Lawliet Bot: `https://github.com/Aninoss/lawliet-bot/tree/master/src/main/jib/data/resources`.
const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } = require('discord.js'),
  { AllContexts, Command, CommandType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,

  async run(lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription')
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: this.commandName,
          style: ButtonStyle.Primary
        })]
      });

    let entity = this.user;
    if (this.member)
      entity = this.member instanceof GuildMember ? this.member : await this.guild.members.fetch(this.member.user.id);

    return this.customReply({ embeds: [embed.setFooter({ text: this.user.tag, iconURL: entity.displayAvatarURL() })], components: [component] });
  }
});