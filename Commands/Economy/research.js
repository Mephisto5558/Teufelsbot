const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, ActionRowBuilder, SelectMenuBuilder, parseEmoji } = require('discord.js');

module.exports = new Command({
  name: 'research',
  aliases: { prefix: ['buy', 'b'], slash: [] },
  description: 'Research and upgrade your skills',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { db, functions }) => {
    const
      userSkills = db.get('guildSettings')[message.guild.id]?.economy?.[message.user.id]?.skills || {},
      defaultSkills = db.get('guildSettings').default.economy.skills,
      fields = Object.entries(defaultSkills).map(([skill, defaultSkill]) => {
        const userSkill = userSkills[skill] || {};
        const price = userSkill.lastPrice ? Math.round(userSkill.lastPrice * (userSkill.percentage || defaultSkill.percentage) / 100) : defaultSkill.firstPrice;

        return {
          name: lang(`skills.${skill}.name`) + ` ${lang('lvl', userSkill.lvl ?? 0)} | ${lang('price', price)} | ${userSkill.lvlUpCooldown || defaultSkill.lvlUpCooldown}h <:research:1011960920609665064>`,
          value: lang(`skills.${skill}.description`),
          inline: false
        }
      }),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        footer: { name: message.user.tag, iconURL: message.member.displayAvatarURL({ forceStatic: true }) },
        fields,
        color: Colors.White
      }),
      component = new ActionRowBuilder({
        components: [new SelectMenuBuilder({
          customId: 'researchMenu',
          maxValues: 1,
          placeholder: lang('selectMenuPlaceholder'),
          options: Object.entries(defaultSkills).map(([skill]) => ({
            label: lang(`skills.${skill}.name`).split('<')[0],
            value: skill,
            description: lang(`skills.${skill}.description`).slice(0, 100),
            emoji: parseEmoji('<' + lang(`skills.${skill}.name`).split('<')[1])
          }))
        })]
      });

    functions.reply({ embeds: [embed], components: [component] }, message);
  }
})