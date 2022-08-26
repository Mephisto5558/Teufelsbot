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
        const price = userSkill.lastPrice ? Math.round(userSkill.lastPrice * userSkill.percentage / 100) : defaultSkill.firstPrice;

        return {
          name: lang(`skills.${skill}.name`) + ' ' + lang(`skills.${skill}.emoji`) + ` ${lang('lvl', userSkill.lvl ?? 0)} | ${lang('price', price)} | ${userSkill.lvlUpCooldown}h <:research:1011960920609665064>`,
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
            label: lang(`skills.${skill}.name`),
            value: skill,
            description: lang(`skills.${skill}.description`).slice(0, 100),
            emoji: lang(`skills.${skill}.emoji`)
          }))
        })]
      });

    const msg = await functions.reply({ embeds: [embed], components: [component] }, message);

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id == message.user.id, time: 60000 });
    collector.on('collect', async button => {
      await button.deferReply();
      const
        skill = button.values[0],
        userSkill = userSkills[skill] || {},
        userData = db.get('guildSettings')[message.guild.id]?.economy?.[message.user.id] || {},
        price = userSkill.lastPrice ? Math.round(userSkill.lastPrice * userSkill.percentage / 100) : defaultSkills[skill].firstPrice;
      let errorMsg;

      if (Object.values(userSkills).filter(e => e.onCooldownUntil > Date.now()).length > userData.maxConcurrentResearches) errorMsg = lang('onMaxConcurrentResearches');
      else if (userData.currency < price) errorMsg = lang('notEnoughMoney');
      else if (userSkill.onCooldownUntil > Date.now()) errorMsg = lang('onCooldown', Math.round(userSkill.onCooldownUntil / 1000));
      else if (userSkill.maxLevel && userSkill.lvl > userSkill.maxLevel) errorMsg = lang('maxLevel');

      if (errorMsg) return button.editReply(errorMsg);
      const onCooldownUntil = new Date(Date.now() + userData.skills[skill].lvlUpCooldown * 360000).getTime();

      const newData = {
        currency: userData.currency - price,
        skills: {
          [skill]: {
            lastPrice: price,
            lvl: userData.skills[skill].lvl + 1,
            onCooldownUntil
          }
        }
      }
      await db.set('guildSettings', Object.merge(db.get('guildSettings'), { [message.guild.id]: { economy: { [message.user.id]: newData } } }));

      button.editReply(lang('success', lang(`skills.${skill}.name`), lang(`skills.${skill}.emoji`), newData.skills[skill].lvl, Math.round(onCooldownUntil / 1000), Math.round(onCooldownUntil / 1000)));
    });

    collector.on('end', _ => {
      component.components[0].data.disabled = true;
      component.components[0].data.placeholder = lang('timedOut');

      msg.edit({ embeds: [embed], components: [component] }, message);
    });

  }
})