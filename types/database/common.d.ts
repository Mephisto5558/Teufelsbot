import type { Channel, Guild, Message, Role, User } from 'discord.js';
import type { Database } from '@mephisto5558/command';

export type guildId = Guild['id'];
export type channelId = Channel['id'];
export type messageId = Message['id'];
export type userId = User['id'];
export type roleId = Role['id'];
export type backupId = `${guildId}_${Snowflake}`;

export type cmdStats = Prettify<Database['botSettings']['cmdStats'] & {
  /** `unknown` are commands that were executed before slash and prefix command stats got counted separately. */
  unknown?: number;
}>;

export type Embed = {
  title: string;
  description: string;
  color: number;
};

export type prefixes = { prefix: string; caseinsensitive: boolean }[];