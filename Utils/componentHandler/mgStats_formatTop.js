const
  medals = [':first_place:', ':second_place:', ':third_place:'],
  { messageMaxLength } = require('../constants');

/** @type {import('.').mgStats_formatTop} */
module.exports = function formatTop(input, sort, mode, lang, maxLength = messageMaxLength, amt = 10) {
  if (input.length > 1) {
    switch (mode) {
      case 'draws': input.sort(([, a], [, b]) => b.draws - a.draws || b.wins - a.wins || a.losses - b.losses); break;
      case 'losses': input.sort(([, a], [, b]) => b.losses - a.losses || a.wins - b.wins || b.draws - a.draws); break;
      case 'alphabet_user': input.sort(([, a], [, b]) => this.guild.members.cache.get(a).user.username.localeCompare(
        this.guild.members.cache.get(b).user.username, lang.__boundArgs__[0].locale, { sensitivity: 'base' }
      )); break;
      case 'alphabet_nick': input.sort(([, a], [, b]) => this.guild.members.cache.get(a).displayName.localeCompare(
        this.guild.members.cache.get(b).displayName, lang.__boundArgs__[0].locale, { sensitivity: 'base' }
      )); break;
      default: input.sort(([, a], [, b]) => b.wins - a.wins || a.draws - b.draws || a.losses - b.losses);
    }

    if (sort == 'f') input.reverse();
  }

  return input.slice(0, amt).reduce((acc, [id, stats], i) => acc + (
    acc.length > maxLength
      ? '...'
      : `${medals[i] ?? i + 1 + '.'} <@${id}>\n`
        + '> ' + lang('wins', stats.wins ?? 0)
        + '> ' + lang('losses', stats.losses ?? 0)
        + '> ' + lang('draws', stats.draws ?? 0)
  ), '');
};