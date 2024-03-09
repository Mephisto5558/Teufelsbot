/* eslint-disable max-lines */

import type { Snowflake, ActivityType, GuildFeature, EmbedData } from 'discord.js';
import { __local } from './globals';
import { GiveawayData } from 'discord-giveaways';

export default Database;

interface Embed {
  title: string;
  description: string;
  color: number;
}

type guildId = Snowflake;
type channelId = Snowflake;
type messageId = Snowflake;
type userId = Snowflake;
type roleId = Snowflake;

declare namespace Database {
  type leaderboards = {
    [gameName: string]: {
      [userId: UserId]: {
        wins?: number;
        draws?: number;
        loses?: number;
        games?: number;
        drewAgainst?: Record<userId | 'AI', number>;
        lostAgainst?: Record<userId | 'AI', number>;
        wonAgainst?: Record<userId | 'AI', number>;
        against?: Record<userId | 'AI', number>;
      };
    };
  };

  type userSettings = {
    [userId: userId]: {
      birthday?: `${number}/${number}/${number}`;
      lastVoted?: number;
      featureRequestAutoApprove?: boolean;
      lastFeatureRequested?: number;
    };
  };

  type guildSettings = {
    default: {
      config: {
        prefix: string;
        lang: string;
        betaBotPrefix: string;
      };
      birthday: {
        ch: {
          msg: {
            embed: Embed;
          };
        };
        dm: {
          msg: {
            embed: Embed;
          };
        };
      };
    };

    [guildId: guildId]: {
      position: number;
      config?: {
        prefix?: {
          prefix?: string;
          caseinsensitive?: boolean;
        };
        lang?: string;
        autopublish: boolean;
        logger?: {
          ['messageUpdate' | 'messageDelete' | 'voiceChannelActivity' | 'sayCommandUsed' | 'all']: {
            channel: channelId;
            enabled: boolean;
          };
        };
      };
      birthday?: {
        ch?: {
          channel?: channelId;
          msg?: {
            enable?: boolean;
            embed?: Embed;
            content?: string;
          };
        };
        dm: {
          enable?: boolean;
          msg: {
            embed?: Embed;
            content?: string;
          };
        };
        enable?: boolean;
      };
      triggers?: {
        id: number;
        trigger: string;
        response: string;
        wildcard: boolean;
      }[];
      gatekeeper?: {
        enabled?: boolean;
        ['join' | 'leave']: {
          channel: channelId;
          message: {
            embed?: Embed;
            content?: string;
          };
        };
      };
      // TODO
      lockedChannels?: {
        [channelId: channelId]: Record<unknown, unknown>;
      };
      // TODO
      afkMessages?: Record<unknown, unknown>;
      // TODO
      giveaway?: {
        [key: string]: unknown; // TODO
        giveaways: GiveawayData[];
      };
      counting?: {
        [channelId: channelId]: {
          lastNumber: number;
          lastAuthor: userId;
        };
      };
      commandSettings?: {
        [commandName: string]: {
          disabled: {
            users?: (userId | '*')[];
            channels?: (channelId | '*')[];
            roles?: (roleId | '*')[];
          };
        };
      };
      lastMentions?: {
        [userId: userId]: {
          content: string;
          url: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
          author: userId;
          channel: channelId;
          createdAt: Date;
        };
      };
      customNames?: {
        [userId: userId]: string;
      };
      minigames?: {
        [gameName: string]: {
          [userId: userId]: {
            player1?: 'r' | 'p' | 's';
            player2?: 'r' | 'p' | 's';
          };
        };
      };
      tickets?: {
        buttonLabel: string;
        channel: channelId;
      };
    };
  };

  type polls = {
    [guildId: guildId]: userId;
  };

  type botSettings = {
    env?: __local.Config;
    activity?: {
      name: string;
      type: ActivityType;
    };
    patreonBonuses?: Record<string, unknown>;
    lastFileClear?: `${number}/${number}`;
    lastBirthdayCheck?: `${number}/${number}`;
    lastDBCleanup?: `${number}/${number}`;
    stats: {
      [commandName: string]: number;
    };
    startCount: {
      [environment: string]: number;
    };
    changelog?: string;
    blacklist?: userId[];
  };

  type backups = {
    [backupId: `${guildId}${Snowflake}`]: {
      id: `${guildId}${Snowflake}`;
      metadata: [userId | userId[]];
      createdTimestamp: number;
      name: string;
      guildId: guildId;
      locale: string;
      features: GuildFeature[];
      iconURL: string;
      splashURL: string?;
      bannerURL: string?;
      systemChannel: string; // Channelname
      systemChannelFlags?: number;
      verificationLevel: number;
      explicitContentFilter: number;
      defaultMessageNotifications: number;
      afk?: {
        name: string; // Channelname
        timeout: number;
      };
      widget: {
        enabled: boolean?;
        channel: unknown?; // Todo
      };
      members: {
        userId: userId;
        username: string;
        discriminator: number;
        nickname: string?;
        avatarUrl: string;
        roles: string[]; // Rolename
        bot: boolean;
      }[];
      bans: {
        id: userId;
        reason: string;
      }[];
      roles: {
        name: string;
        color: number;
        hoist: boolean;
        permissions: `${bigint}`;
        mentionable: boolean;
        position: number;
        isEveryone: boolean;
      }[];
      emojis: {
        name: string;
        url: string;
      }[];
      stickers: {
        name: string;
        url: string;
      }[];
      channels: {
        categories: {
          name: string;
          permissions: {
            name: string;
            allow: `${bigint}`;
            deny: `${bigint}`;
          }[];
          children: {
            type: number;
            name: string;
            nsfw: boolean;
            rateLimitPerUser: number;
            topic: string;
            permissions: {
              name: string;
              allow: `${bigint}`;
              deny: `${bigint}`;
            }[];
            messages: {
              username: string;
              avatar: string;
              content: string;
              embeds: EmbedData[];

              // Todo
              files: unknown[];
              pinned: boolean;
              createdAt: `${Date}`;
            }[];
            isNews: boolean;
            // Todo
            threads: unknown[];
          }[];
          // Todo
          others: unknown;
        }[];
      };
    };
  };

  type website = {
    requests: {
      [requestId: string | `${userId}_${number}`]: {
        id: string | `${userId}_${number}`;
        title: string;
        body: string;
        votes?: number;
      };
    };
    sessions: {
      [sessionId: string]: {
        cookie: {
          path: string;
          _expires: Date?;
          originalMaxAge: number?;
          httpOnly: boolean;
          secure?: boolean;
          domain?: string;
        };
        passport?: {
          user: {
            id: userId;
            username: string;
            locale: string;
            avatar: string;
            banner: string?;
          };
        };
        discordAuthStatus?: {
          loading: boolean;
          success: boolean;
          state: {
            error: unknown?;
            data: unknown?;
          };
        };
        redirectURL?: string;
        r?: string;
        user?: {
          id: userId;
          username: string;
          avatar: string;
          discriminator: `${number}`;
          public_flags: number;
          flags: number;
          banner: string?;
          accent_color: number;
          global_name: string;
          avatar_decoration_data: unknown?;
          banner_color: `#${number}`;
          mfa_enabled: boolean;
          locale: string;
          premium_type: number;
          email: string;
          verified: boolean;
          tag: `${string}#${number}`;
          avatarURL: string;
        };
        loggedInLastTime?: boolean;
        guilds?: {
          id: guildId;
          name: string;
          icon: string;
          owner: boolean;
          permissions: `${bigint}`;
          features: GuildFeature[];
        }[];
        errors?: unknown?;
        success?: boolean?;
      };
    };
  };
}