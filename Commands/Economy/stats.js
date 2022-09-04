const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'stats',
  aliases: { prefix: [], slash: [] },
  description: 'Get more in-depth stats',
  usage: 'stats [user]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'userDatanomy',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'user',
    description: 'The user you want to get data about',
    type: 'User',
    required: false
  }],
  beta: true,

  run: async (message, lang, { db }) => {
    const
      target = message.options?.getUser('user') || message.mentions?.users?.first() || message.user,
      userData = db.get('guildSettings')[message.guild.id]?.economy?.[target.id];

    if (!userData?.gaining?.chat) return message.customReply(lang('noStats'));

    const fields = [
      { name: lang('currency'), value: `> ${userData.currency}/${userData.currencyCapacity}` },
      { name: `${lang('power')}/${lang('defense')}`, value: `> ${userData.power}/${userData.defense}` },
      { name: `${lang('slaves')}/${lang('maxSlaves')}`, value: `> ${userData.slaves}/${userData.maxSlaves}` },
      {
        name: lang('gaining.title'), value: '>>> ' +
          Object.entries(userData.gaining)
            .filter(([, e]) => e)
            .map(([k, v]) => {
              let amount = v;
              switch (k) {
                case 'chat': amount = parseFloat((Math.pow(userData.skills.currency_bonus_absolute.lvl, 2) + v * Math.pow(userData.skills.currency_bonus_percentage.lvl, 2) / 100).toFixed(3)); break;
              }

              return lang(`gaining.${k}`, amount);
            })
            .join('\n')
      },
      {
        name: lang('skills.name'), value: (Object.entries(userData.skills)
          .filter(([, { lvl }]) => lvl)
          .map(([k, { lvl }]) => lang(`skills.${k}`) + lang('level', lvl))
          .join('\n') || 'none')
      }
    ],
      embed = new EmbedBuilder({
        title: lang('embedTitle', target.tag),
        fields,
        color: Colors.White,
        footer: { name: message.user.tag, iconURL: message.member.displayAvatarURL({ forceStatic: true }) },
      });

    message.customReply({ embeds: [embed] })
  }
}