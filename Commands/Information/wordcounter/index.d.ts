import type { EmbedField, Guild } from 'discord.js';

type data = {
  options?: commandOptions<false>[];
  run: NonNullable<command<'slash', false>['run']>;
};
export default data;

export function getTopChannels(
  this: GuildInteraction | DMInteraction,
  _lang: lang, guild: Guild,
  amt?: number
): EmbedField[];

export function getTopMembers(
  this: GuildInteraction | DMInteraction,
  lang: lang, guild: Guild,
  amt?: number
): EmbedField[];

export function getTopChannelMembers(
  this: GuildInteraction | DMInteraction,
  lang: lang, guild: Guild, channelId: Snowflake,
  amt?: number
): EmbedField[];