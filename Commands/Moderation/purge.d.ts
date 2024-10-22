import type Discord from 'discord.js';

type UserType<User extends Discord.User> = User['bot'] extends true ? 'bot' : 'human';

type shouldDeleteMsgOptions<User extends Discord.User> = {
  amount: number;
  only_containing?: 'text' | 'embeds' | 'mentions' | 'images' | 'server_ads';
  member?: User;
  channel?: Discord.GuildTextBasedChannel;
  remove_pinned?: boolean;
  caps_percentage?: number;
  contains?: string;
  does_not_contain?: string;
  starts_with?: string;
  not_starts_with?: string;
  ends_with?: string;
  not_ends_with?: string;
  user_type?: UserType<User>;
  before_message?: Snowflake;
  after_message?: Snowflake;
};

export function shouldDeleteMsg<User extends Discord.User>(msg: Message<true>, options: shouldDeleteMsgOptions<User>): boolean;