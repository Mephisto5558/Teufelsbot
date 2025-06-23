import type { EmbedField, Guild, User } from 'discord.js';

type data = {
  options?: commandOptions<false>[];
  run: NonNullable<command<'slash', false>['run']>;
};
export default data;

export function getTopGuilds(user: User, amt?: number): EmbedField[];
export function getTopChannels(guild: Guild, amt?: number): EmbedField[];
export function getTopMembers(guild: Guild, amt?: number): EmbedField[];
export function getTopChannelMembers(guild: Guild, channelId: Snowflake, amt?: number): EmbedField[];