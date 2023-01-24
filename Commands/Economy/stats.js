const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'stats',
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'target', type: 'User' }],
  beta: true,

  run: function (lang) {
    const
      target = this.options?.getUser('target') || this.mentions?.users.first() || this.user,
      userData = this.guild.db.economy?.[target.id];

    if (!userData?.gaining?.chat) return this.customReply(lang('noStats'));

    const fields = [
      { name: lang('currency'), value: `> ${userData.currency}/${userData.currencyCapacity}` },
      { name: `${lang('power')}/${lang('defense')}`, value: `> ${userData.power}/${userData.defense}` },
      { name: `${lang('slaves')}/${lang('maxSlaves')}`, value: `> ${userData.slaves}/${userData.maxSlaves}` },
      {
        name: lang('gaining.title'), value: '>>> ' +
          Object.entries(userData.gaining)
            .filter(([, e]) => e)
            .map(([k, v]) => {
              let amount;
              if (k == 'chat') amount = parseFloat((v + userData.skills.currency_bonus_absolute.lvl ** 2 + v * userData.skills.currency_bonus_percentage.lvl ** 2 / 100).toFixed(3));

              return lang(`gaining.${k}`, amount ?? v);
            })
            .join('\n')
      },
      {
        name: lang('skills.name'), value: (Object.entries(userData.skills)
          .filter(([, { lvl }]) => lvl)
          .map(([k, { lvl }]) => lang(`skills.${k}`) + lang('level', lvl))
          .join('\n') || lang('global.none'))
      }
    ],
      embed = new EmbedBuilder({
        title: lang('embedTitle', target.customTag),
        fields,
        color: Colors.White,
        footer: { name: this.user.tag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
      });

    this.customReply({ embeds: [embed] });
  }
};