const { EmbedBuilder, Colors, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'research',
  aliases: { prefix: ['buy', 'b'], slash: ['buy'] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  requireEconomy: true,
  beta: true,

  run: async (message, lang, { db }) => {
    const
      userSkills = db.get('guildSettings')[message.guild.id].economy[message.user.id].skills,
      defaultSkills = db.get('guildSettings').default.economy.skills,
      fields = Object.entries(defaultSkills).map(([skill, defaultSkill]) => {
        const price = userSkills[skill].lastPrice ? userSkills[skill].lastPrice + Math.round(userSkills[skill].lastPrice * userSkills[skill].percentage / 100) : defaultSkill.firstPrice;

        return {
          name: lang(`skills.${skill}.name`) + ' ' + lang(`skills.${skill}.emoji`) + ` ${lang('lvl', userSkills[skill].lvl)} | ${lang('price', price)} | ${userSkills[skill].lvlUpCooldown}h <:research:1011960920609665064>`,
          value: lang(`skills.${skill}.description`),
          inline: false
        }
      }),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        footer: { name: message.user.tag, iconURL: message.member.displayAvatarURL({ forceStatic: true }) },
        fields, color: Colors.White
      }),
      component = new ActionRowBuilder({
        components: [new SelectMenuBuilder({
          customId: 'researchMenu',
          maxValues: 1,
          placeholder: lang('selectMenuPlaceholder'),
          options: Object.entries(defaultSkills).map(([skill]) => ({
            label: lang(`skills.${skill}.name`),
            value: skill,
            description: lang(`skills.${skill}.description`).slice(0, 100),
            emoji: lang(`skills.${skill}.emoji`)
          }))
        })]
      });

    const msg = await message.customReply({ embeds: [embed], components: [component] });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id == message.user.id, time: 60000 });
    collector.on('collect', async button => {
      await button.deferReply();

      const
        skill = button.values[0],
        userData = db.get('guildSettings')[message.guild.id].economy[message.user.id],
        userSkill = userData.skills[skill],
        price = userSkill.lastPrice ? userSkill.lastPrice + Math.round(userSkill.lastPrice * userSkill.percentage / 100) : defaultSkills[skill].firstPrice;
      let errorMsg;

      if (Object.values(userSkills).filter(e => e.onCooldownUntil > Date.now()).length > userData.maxConcurrentResearches) errorMsg = lang('onMaxConcurrentResearches');
      else if (userSkill.onCooldownUntil > Date.now()) errorMsg = lang('onCooldown', Math.round(userSkill.onCooldownUntil / 1000));
      else if (userSkill.maxLevel && userSkill.lvl > userSkill.maxLevel) errorMsg = lang('maxLevel');
      else if (userData.currency < price) errorMsg = lang('notEnoughMoney');

      if (errorMsg) return button.editReply(errorMsg);
      const onCooldownUntil = new Date(Date.now() + userSkill.lvlUpCooldown * 360000).getTime();

      const newData = {
        currency: (userData.currency - price).toFixed(3),
        skills: {
          [skill]: {
            lastPrice: price.toFixed(3),
            lvl: userSkill.lvl + 1,
            onCooldownUntil
          }
        }
      }

      db.set('guildSettings', db.get('guildSettings').fMerge({ [message.guild.id]: { economy: { [message.user.id]: newData } } }));

      button.editReply(lang('success', { skill: lang(`skills.${skill}.name`), emoji: lang(`skills.${skill}.emoji`), lvl: newData.skills[skill].lvl, time: Math.round(onCooldownUntil / 1000) }));
    });

    collector.on('end', _ => {
      component.components[0].data.disabled = true;
      component.components[0].data.placeholder = lang('timedOut');

      msg.edit({ embeds: [embed], components: [component] }, message);
    });

  }
}