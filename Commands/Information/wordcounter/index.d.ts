import type { EmbedField, Guild, GuildChannel, GuildMember, User, bold } from 'discord.js';

export function getTopGuilds(user: User, amt?: number): EmbedField[];
export function getTopChannels(guild: Guild, amt?: number): EmbedField[];
export function getTopMembers(guild: Guild, amt?: number): EmbedField[];
export function getTopChannelMembers(guild: Guild, channelId: Snowflake, amt?: number): EmbedField[];

export function format<K, V>(
  data: Record<K, V>, sliceAmt: number,
  mapFn: (data: [K, V]) => [Guild | GuildChannel | GuildMember | undefined, number | undefined]
): { name: string; value: ReturnType<typeof bold<V>>; inline: false }[];