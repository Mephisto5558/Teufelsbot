const { EmbedBuilder, Colors, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'research',
  aliases: { prefix: ['buy', 'b'], slash: ['buy'] },
  slashCommand: true,
  prefixCommand: true,
  requireEconomy: true,
  beta: true,

  run: async function (lang) {
    const
      userSkills = this.guild.db.economy[this.user.id].skills,
      defaultSkills = this.client.defaultSettings.economy.skills,
      fields = Object.entries(defaultSkills).map(([skill, defaultSkill]) => {
        const price = userSkills[skill].lastPrice ? userSkills[skill].lastPrice + Math.round(userSkills[skill].lastPrice * userSkills[skill].percentage / 100) : defaultSkill.firstPrice;

        return {
          name: lang(`skills.${skill}.name`) + ' ' + lang(`skills.${skill}.emoji`) + ` ${lang('lvl', userSkills[skill].lvl)} | ${lang('price', price)} | ${userSkills[skill].lvlUpCooldown}h <:research:1011960920609665064>`,
          value: lang(`skills.${skill}.description`),
          inline: false
        };
      }),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        footer: { name: this.user.tag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
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

    const msg = await this.customReply({ embeds: [embed], components: [component] });

    return msg.createMessageComponentCollector({ filter: i => i.user.id == this.user.id, idle: 6e4 })
      .on('collect', async button => {
        await button.deferReply();

        const
          skill = button.values[0],
          userData = this.guild.db.economy[this.user.id],
          userSkill = userData.skills[skill],
          price = userSkill.lastPrice ? userSkill.lastPrice + Math.round(userSkill.lastPrice * userSkill.percentage / 100) : defaultSkills[skill].firstPrice;
        let errorMsg;

        if (Object.values(userSkills).filter(e => e.onCooldownUntil > Date.now()).length > userData.maxConcurrentResearches) errorMsg = lang('onMaxConcurrentResearches');
        else if (userSkill.onCooldownUntil > Date.now()) errorMsg = lang('onCooldown', Math.round(userSkill.onCooldownUntil / 1000));
        else if (userSkill.maxLevel && userSkill.lvl > userSkill.maxLevel) errorMsg = lang('maxLevel');
        else if (userData.currency < price) errorMsg = lang('notEnoughMoney');

        if (errorMsg) return button.editReply(errorMsg);
        const onCooldownUntil = new Date(Date.now() + userSkill.lvlUpCooldown * 36e4).getTime();

        const newData = {
          currency: (userData.currency - price).toFixed(3),
          skills: {
            [skill]: {
              lastPrice: price.toFixed(3),
              lvl: userSkill.lvl + 1,
              onCooldownUntil
            }
          }
        };

        this.client.db.update('guildSettings', `${this.guild.id}.economy.${this.user.id}`, newData);

        return button.editReply(lang('success', { skill: lang(`skills.${skill}.name`), emoji: lang(`skills.${skill}.emoji`), lvl: newData.skills[skill].lvl, time: Math.round(onCooldownUntil / 1000) }));
      })
      .on('end', () => {
        component.components[0].data.disabled = true;
        component.components[0].data.placeholder = lang('timedOut');

        return msg.edit({ embeds: [embed], components: [component] });
      });

  }
};