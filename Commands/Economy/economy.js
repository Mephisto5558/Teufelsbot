const { Command } = require('reconlx');

module.exports = new Command({
  name: 'economy',
  aliases: { prefix: [], slash: [] },
  description: 'Some Economy Configs',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  options: [
    {
      name: 'start',
      description: 'Start using the economy commands!',
      type: 'Subcommand',
    },
    {
      name: 'config',
      description: 'Configurate the economy in this guild.',
      type: 'Subcommand'
    }
  ],
  beta: true,

  run: async (interaction, lang, { db }) => {
    const defaultSettings = db.get('guildSettings').default.economy;

    switch (interaction.options.getSubcommand()) {
      case 'start': {
        if (db.get('guildSettings')[interaction.guild.id]?.economy?.[interaction.user.id]?.gaining?.chat)
          return interaction.editReply(lang('start.alreadyInitiated'));

        await db.set('guildSettings', Object.merge(db.get('guildSettings'), {
          [interaction.guild.id]: {
            economy: {
              [interaction.user.id]: {
                currency: defaultSettings.currency ?? 0,
                currencyCapacity: defaultSettings.currencyCapacity,
                power: defaultSettings.power ?? 0,
                defense: defaultSettings.defense ?? 0,
                dailyStreak: 0,
                slaves: 0,
                maxSlaves: defaultSettings.maxSlaves,
                maxConcurrentResearches: defaultSettings.maxConcurrentResearches,
                gaining: defaultSettings.gaining,
                skills: Object.fromEntries(Object.entries(defaultSettings.skills).map(([skill, { ...e }]) => {
                  delete e.firstPrice;
                  e.lastPrice = 0;
                  e.bonus = 0;

                  if (!e.onCooldownUntil) e.onCooldownUntil = 0;
                  if (!e.lvl) e.lvl = 0;
                  if (!e.maxLvl) e.maxLvl = 0;
                  if (!e.percentage) e.percentage = 18;

                  return [skill, e];
                }))
              }
            }
          }
        }));

        return interaction.editReply(lang('start.success'));
      }
      case 'config': return interaction.editReply('Coming Soon!');
    }

  }
})