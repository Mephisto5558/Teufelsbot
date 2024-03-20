import type { DMChannel, GuildChannel, GuildMember, Role, User } from 'discord.js';

type MaybeWithUndefined<X, T extends boolean> = T extends true ? X : X | undefined;

export function getTargetChannel<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName = 'channel', returnSelf }: { targetOptionName?: string; returnSelf?: T }
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildChannel, T> : MaybeWithUndefined<DMChannel, T>;

export function getTargetRole<T extends boolean>(
  interaction: GuildInteraction | Message<true>,
  { targetOptionName = 'target', returnSelf }: { targetOptionName?: string; returnSelf?: T }
): MaybeWithUndefined<Role, T>;

export function getTargetMember<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName = 'target', returnSelf }: { targetOptionName?: string; returnSelf?: T }
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildMember, T> : MaybeWithUndefined<User, T>;