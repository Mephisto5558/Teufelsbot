import type { Command, CommandType } from '@mephisto5558/command';

export type guildId = Snowflake;
export type channelId = Snowflake;
export type messageId = Snowflake;
export type userId = Snowflake;
export type roleId = Snowflake;
export type backupId = `${guildId}_${Snowflake}`;

export type cmdStats = Record<Command['name'],
  Partial<Record<CommandType, number>> & {
    /** `unknown` are commands that were executed before slash and prefix command stats got counted separately. */
    unknown?: number;
  }
>;

export type Embed = {
  title: string;
  description: string;
  color: number;
};

export type prefixes = { prefix: string; caseinsensitive: boolean }[];