import formatTop from './mgStats_formatTop.ts';

import type { ActionRow, InteractionResponse, StringSelectMenuComponent, StringSelectMenuInteraction } from 'discord.js';

export default async function mgStats<
  GAME extends string, MODE extends 'sort' | undefined, SETTINGS extends 'all_users' | undefined
>(
  this: StringSelectMenuInteraction<'cached'> & {
    customId: `mgstats.${GAME}.${MODE}.${SETTINGS}`;
    message: {
      components: [ActionRow<StringSelectMenuComponent>];
    };
  },
  lang: lang, game: GAME, wMode: MODE, settings: SETTINGS
): Promise<MODE extends 'sort' ? InteractionResponse : undefined> {
  if (wMode != 'sort') return;

  lang.config.backupPaths[0] = 'commands.minigames.mgstats';

  const [sort, mode] = this.values[0]?.split('_') ?? [];
  this.message.embeds[0].data.description = formatTop.call(this,
    Object.entries(
      Object.entries(this.client.db.get('leaderboards')).find(([k]) => k == game)?.[1] ?? []
    ).filter(([e]) => settings == 'all_users' || this.guild.members.cache.has(e)),
    lang, { sort, mode }) ?? lang('noWinners');

  delete this.message.components[0].components[0].options.find(e => e.default).default;
  this.message.components[0].components[0].options.find(e => e.value === this.values[0]).default = true;

  return this.update({ embeds: this.message.embeds, components: this.message.components });
}