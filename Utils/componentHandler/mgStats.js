const formatTopTen = require('./mgStats_formatTopTen.js');

/** this.customId: `mgstats.<game>.<mode>.<setting>`
 * @this import('discord.js').StringSelectMenuInteraction @param {lang}lang @param {string}game @param {string}mode @param {string}settings*/
module.exports = async function mgStats(lang, game, wMode, settings) {
  if (wMode != 'sort') return;

  lang.__boundArgs__[0].backupPath = 'commands.minigames.mgstats';

  const [sort, mode] = this.values?.[0]?.split('_') || [];
  this.message.embeds[0].data.description = await formatTopTen.call(this,
    Object.entries(Object.entries(this.client.db.get('leaderboards')).find(([k]) => k == game)?.[1] || [])
      .filter(([e]) => settings == 'all_users' || this.guild.members.cache.has(e)),
    sort, mode, lang
  ) || lang('noWinners');

  delete this.message.components[0].components[0].options.find(e => e.default).default;
  this.message.components[0].components[0].options.find(e => e.value === this.values[0]).default = true;

  return this.update({ embeds: this.message.embeds, components: this.message.components });
};