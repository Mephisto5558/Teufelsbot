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

    const
      fields = [
        { name: lang('currency'), value: `> ${userData.currency}/${userData.currencyCapacity}` },
        { name: `${lang('power')}/${lang('defense')}`, value: `> ${userData.power}/${userData.defense}` },
        { name: `${lang('slaves')}/${lang('maxSlaves')}`, value: `> ${userData.slaves}/${userData.maxSlaves}` },
        {
          name: lang('gaining.title'), value: '>>>' + Object.entries(userData.gaining).reduce((acc, [k, v]) => {
            if (!v) return acc;
            const str = lang(`gaining.${k}`, parseFloat((v + userData.skills.currency_bonus_absolute.lvl ** 2 + v * userData.skills.currency_bonus_percentage.lvl ** 2 / 100).toFixed(3)) ?? v);
            return acc ? `${acc}\n${str}` : str;
          }, '')
        },
        {
          name: lang('skills.name'), value: Object.entries(userData.skills).reduce((acc, [k, { lvl }]) => {
            if (!lvl) return acc;
            const str = lang(`skills.${k}`) + lang('level', lvl);
            return acc ? `${acc}\n${str}` : str;
          }, '') || lang('global.none')
        }
      ],
      embed = new EmbedBuilder({
        title: lang('embedTitle', target.customTag),
        fields,
        color: Colors.White,
        footer: { name: this.user.tag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
      });

    return this.customReply({ embeds: [embed] });
  }
};