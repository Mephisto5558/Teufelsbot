const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

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
          skill: lang(`skills.${skill}.name`) + ` ${lang('lvl', userSkill.lvl ?? 0)} | ${lang('price', price)} | ${userSkill.lvlUpCooldown || defaultSkill.lvlUpCooldown}h`,
          value: lang(`skills.${skill}.description`),
          inline: false
        }
      }),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        fields,
        colors: Colors.White
      });

    functions.reply({ embeds: [embed] }, message);
  }
})