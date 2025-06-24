import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';

type data = {
  options?: SlashCommand['options'];
  run(
    this: ThisParameterType<SlashCommand['run']>,
    lang: Parameters<SlashCommand['run']>[0],
    options: {
      components: ActionRowBuilder<ButtonBuilder>[];
      bonusEntries?: Record<string, string>[]; requiredRoles?: string[];
      disallowedMembers?: string[]; duration?: number;
    },
    ...rest: OmitFirstParameter<SlashCommand['run']>
  ): ReturnType<SlashCommand['run']>;
};
export= data;