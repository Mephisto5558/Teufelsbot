import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';

type fn = NonNullable<command<'slash'>['run']>;

type data = {
  options?: commandOptions<false>[];
  run(
    this: ThisParameterType<fn>,
    lang: Parameters<fn>[0],
    options: {
      components: ActionRowBuilder<ButtonBuilder>[];
      bonusEntries?: Record<Snowflake, string>; requiredRoles?: Snowflake[];
      disallowedMembers?: Snowflake[]; duration?: number;
    },
    ...rest: OmitFirstParameters<fn>
  ): ReturnType<fn>;
};
export= data;