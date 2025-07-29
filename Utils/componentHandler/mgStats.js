const formatTop = require('./mgStats_formatTop.js');

/** @type {import('.').mgStats} */
module.exports = async function mgStats(lang, game, wMode, settings) {
  if (wMode != 'sort') return;

  lang.config.backupPath[0] = 'commands.minigames.mgstats';

  const [sort, mode] = this.values[0]?.split('_') ?? [];
  this.message.embeds[0].data.description = formatTop.call(this,
    Object.entries(
      Object.entries(this.client.db.get('leaderboards')).find(([k]) => k == game)?.[1] ?? []
    ).filter(([e]) => settings == 'all_users' || this.guild.members.cache.has(e)),
    sort, mode, lang) ?? lang('noWinners');

  delete this.message.components[0].components[0].options.find(e => e.default).default;
  this.message.components[0].components[0].options.find(e => e.value === this.values[0]).default = true;

  return this.update({ embeds: this.message.embeds, components: this.message.components });
};