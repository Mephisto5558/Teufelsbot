const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'stats',
  aliases: { prefix: [], slash: [] },
  description: 'Get more in-depth stats',
  usage: 'stats [user]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'user',
    description: 'The user you want to get data about',
    type: 'User',
    required: false
  }],
  beta:true,

  run: async (message, lang, { db, functions }) => {
    const
      target = message.options?.getUser('user') || message.mentions?.users.first() || message.user,
      userData = db.get('guildSettings')[message.guild.id]?.economy?.[target.id];
      
      if(!userData || !userData.power) return functions.reply(lang('noStats'), message);
      
      const fields = [
        { name: lang('currency'), value: `${userData.currency}/${userData.currencyCapacity}` },
        { name: `${lang('power')}/${lang('defense')}`, value: `${userData.power}/${userData.defense}` },
        { name: `${lang('slaves')}/${lang('maxSlaves')}`, value: `${userData.slaves}/${userData.maxSlaves}` },
        {
          name: lang('gaining.title'), value: '>>> ' +
            Object.entries(userData.gaining)
              .filter(([, e]) => e)
              .map(([k, v]) => lang(`gaining.${k}`, v))
              .join('\n')
        },
        {
          name: lang('skills'), value: '>>> ' +
            Object.entries(userData.skills)
              .filter(([, e]) => e.lvl)
              .map(([k, v]) => lang(`skills.${k}`, v.lvl))
              .join('\n')
        }
      ],
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        fields,
        color: Colors.White,
      });

    functions.reply({ embeds: [embed] })
  }
})