import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import type { CommandOption, CommandType } from '@mephisto5558/command';

type GiveawaySubcommand = CommandOption<[CommandType.Slash], boolean, {
  components: ActionRowBuilder<ButtonBuilder>[];
  bonusEntries?: Record<Snowflake, string>; requiredRoles?: Snowflake[];
  disallowedMembers?: Snowflake[]; duration?: number; giveawayId?: Snowflake;
}>;
export default GiveawaySubcommand;