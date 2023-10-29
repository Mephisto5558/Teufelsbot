const medals = [':first_place:', ':second_place:', ':third_place:'];

/**@this import('discord.js').StringSelectMenuInteraction @param {{draws?:number, wins?:number, loses?:number}[]}input @param {string}sort @param {string}mode @param {lang}lang*/
module.exports = async function formatTopTen(input, sort, mode, lang) {
  if (input.length > 1) {
    switch (mode) {
      case 'draws': input.sort(([, a], [, b]) => b.draws - a.draws || b.wins - a.wins || a.loses - b.loses); break;
      case 'loses': input.sort(([, a], [, b]) => b.loses - a.loses || a.wins - b.wins || b.draws - a.draws); break;
      case 'alphabet_user': input.sort(([, a], [, b]) => this.guild.members.cache.get(a).user.username.localeCompare(this.guild.members.cache.get(b).user.username, lang.__boundArgs__[0].locale, { sensitivity: 'base' })); break;
      case 'alphabet_nick': input.sort(([, a], [, b]) => this.guild.members.cache.get(a).displayName.localeCompare(this.guild.members.cache.get(b).displayName, lang.__boundArgs__[0].locale, { sensitivity: 'base' })); break;
      default: input.sort(([, a], [, b]) => b.wins - a.wins || a.draws - b.draws || a.loses - b.loses);
    }

    if (sort == 'f') input.reverse();
  }

  return input.slice(0, 10).reduce((acc, [id, stats], i) => acc + (
    acc.length > 3997 ? '...' : `${medals[i] || i + 1 + '.'} <@${id}>\n` +
      '> ' + lang('wins', stats.wins || 0) +
      '> ' + lang('loses', stats.loses || 0) +
      '> ' + lang('draws', stats.draws || 0)
  ), '');
};