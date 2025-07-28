export type guildId = Snowflake;
export type channelId = Snowflake;
export type messageId = Snowflake;
export type userId = Snowflake;
export type roleId = Snowflake;
export type backupId = `${guildId}${Snowflake}`;

/** `unknown` are commands that were executed before slash and prefix command stats got counted separately. */
export type cmdStats = Record<string, Record<'slash' | 'prefix' | 'unknown', number>>;

export type Embed = {
  title: string;
  description: string;
  color: number;
};