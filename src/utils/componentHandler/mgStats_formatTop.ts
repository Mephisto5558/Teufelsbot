import { userMention } from 'discord.js';
import { messageMaxLength } from '../constants.ts';
import convertToMedal from '../convertToMedal.ts';
import type { BaseInteraction } from 'discord.js';

export default function formatTop(
  this: BaseInteraction<'cached'> | Message<true>,
  input: [Snowflake, { draws?: number; wins?: number; losses?: number }][],
  lang: lang,
  { sort, mode, maxLength = messageMaxLength, amt = 10 }: {
    sort?: 'f'; mode?: 'draws' | 'losses' | 'alphabet_user' | 'alphabet_nick'; maxLength?: number; amt?: number;
  } = {}
): string | undefined {
  const data = input.map(([id, e]) => [id, { wins: 0, draws: 0, losses: 0, ...e }] as const);

  if (input.length > 1) {
    switch (mode) {
      case 'draws': data.sort(([, a], [, b]) => b.draws - a.draws || b.wins - a.wins || a.losses - b.losses); break;
      case 'losses': data.sort(([, a], [, b]) => b.losses - a.losses || a.wins - b.wins || b.draws - a.draws); break;
      case 'alphabet_user': data.sort(([a], [b]) => this.guild.members.cache.get(a).user.username.localeCompare(
        this.guild.members.cache.get(b).user.username, lang.config.locale, { sensitivity: 'base' }
      )); break;
      case 'alphabet_nick': data.sort(([a], [b]) => this.guild.members.cache.get(a).displayName.localeCompare(
        this.guild.members.cache.get(b).displayName, lang.config.locale, { sensitivity: 'base' }
      )); break;
      default: data.sort(([, a], [, b]) => b.wins - a.wins || a.draws - b.draws || a.losses - b.losses);
    }

    if (sort == 'f') data.reverse();
  }

  return data.slice(0, amt).reduce((acc, [id, stats], i) => acc + (
    acc.length > maxLength
      ? '...'
      : `${convertToMedal(i)} ${userMention(id)}\n`
        + `> ${lang('wins', stats.wins)}\n`
        + `> ${lang('losses', stats.losses)}\n`
        + `> ${lang('draws', stats.draws)}\n\n`
  ), '') || undefined;
}