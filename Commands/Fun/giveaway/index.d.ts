import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import type { CommandOption } from '@mephisto5558/command';

type GiveawaySubcommand = CommandOption<['slash'], boolean, {
  components: ActionRowBuilder<ButtonBuilder>[];
  bonusEntries?: Record<Snowflake, string>; requiredRoles?: Snowflake[];
  disallowedMembers?: Snowflake[]; duration?: number; giveawayId?: Snowflake;
}>;
export default GiveawaySubcommand;