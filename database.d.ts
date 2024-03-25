/* eslint-disable max-lines */

import type { Snowflake, ActivityType, GuildFeature, EmbedData } from 'discord.js';
import { __local } from './globals';
import { GiveawayData } from 'discord-giveaways';

export { Database, FlattenedDatabase };

interface Embed {
  title: string;
  description: string;
  color: number;
}

type backupChannel = {
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
};

type guildId = Snowflake;
type channelId = Snowflake;
type messageId = Snowflake;
type userId = Snowflake;
type roleId = Snowflake;

type Database = {
  leaderboards: {
    [gameName: string]: {
      [userId: userId]: {
        wins?: number;
        draws?: number;
        loses?: number;
        games?: number;
        drewAgainst?: Record<userId | 'AI', number>;
        lostAgainst?: Record<userId | 'AI', number>;
        wonAgainst?: Record<userId | 'AI', number>;
        against?: Record<userId | 'AI', number>;
      } | undefined;
    } | undefined;
  };

  userSettings: {
    [userId: userId]: {
      birthday?: Date;
      customName?: string;
      afkMessage?: {
        message: string;
        createdAt: number;
      };
      lastVoted?: Date;
      featureRequestAutoApprove?: boolean;
      lastFeatureRequested?: number;
    } | undefined;
  };

  guildSettings: {
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
      serverbackup: {
        allowedToLoad: number;
      };
      giveaway: {
        reaction: string;
        embedColor: number;
        embedColorEnd: number;
      };
    };

    [guildId: guildId]: {
      position: number;
      config?: {
        prefix?: {
          prefix?: string;
          caseinsensitive?: boolean;
        };
        betaBotPrefix?: {
          prefix?: string;
          caseinsensitive?: boolean;
        };
        lang?: string;
        autopublish: boolean;
        logger?: Record<'messageUpdate' | 'messageDelete' | 'voiceChannelActivity' | 'sayCommandUsed' | 'all', {
          channel: channelId;
          enabled: boolean;
        } | undefined>;
      };
      birthday?: {
        enable?: boolean;
        ch?: {
          channel?: channelId;
          msg?: {
            enable?: boolean;
            embed?: Embed;
            content?: string;
          };
        };
        dm?: {
          enable?: boolean;
          msg?: {
            embed?: Embed;
            content?: string;
          };
        };
      };
      triggers?: {
        id: number;
        trigger: string;
        response: string;
        wildcard: boolean;
      }[];
      gatekeeper?: {
        enable?: boolean;
        ['join' | 'leave']: {
          channel: channelId;
          message: {
            embed?: Embed;
            content?: string;
          };
        } | undefined;
      };
      // TODO
      lockedChannels?: {
        [channelId: channelId]: Record<unknown, unknown> | undefined;
      };
      afkMessages?: {
        [userId: userId]: {
          message: string;
          createdAt: number;
        } | undefined;
      };
      giveaway?: {
        reaction?: string;
        embedColor?: number;
        embedColorEnd?: number;
        useLastChance?: boolean;
        giveaways: GiveawayData[];
      };
      counting?: {
        [channelId: channelId]: {
          lastNumber: number;
          lastAuthor: userId;
        } | undefined;
      };
      commandSettings?: {
        [commandName: string]: {
          disabled: {
            users?: (userId | '*')[];
            channels?: (channelId | '*')[];
            roles?: (roleId | '*')[];
          };
        } | undefined;
      };
      lastMentions?: {
        [userId: userId]: {
          content: string;
          url: `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
          author: userId;
          channel: channelId;
          createdAt: Date;
        } | undefined;
      };
      customNames?: {
        [userId: userId]: string | undefined;
      };
      minigames?: {
        rps: {
          [messageId: messageId]: {
            player1?: 'r' | 'p' | 's';
            player2?: 'r' | 'p' | 's';
          } | undefined;
        };
        [gameName: string]: {
          [messageId: messageId]: unknown; // TODO
        } | undefined;
      };
      tickets?: {
        buttonLabel: string;
        channel: channelId;
      };
      serverbackup?: {
        allowedToLoad?: number;
      };
    } | undefined;
  };

  polls: {
    [guildId: guildId]: userId | undefined;
  };

  botSettings: {
    env?: __local.Env;
    activity?: {
      name: string;
      type: ActivityType;
    };
    patreonBonuses?: Record<string, unknown>;
    lastFileClear?: Date;
    lastBirthdayCheck?: Date;
    lastDBCleanup?: Date;
    stats: {
      [commandName: string]: number | undefined;
    };
    startCount: {
      [environment: string]: number | undefined;
    };
    changelog?: string;
    blacklist?: userId[];
  };

  backups: {
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
      members?: {
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
          children: backupChannel[];
          // Todo
        }[];

        /** Channels that are not in a category*/
        others: backupChannel[];
      };
    } | undefined;
  };

  website: {
    requests: {
      [requestId: string | `${userId}_${number}`]: {
        id: string | `${userId}_${number}`;
        title: string;
        body: string;
        votes?: number;
      } | undefined;
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
      } | undefined;
    };
  };
};

type FlattenedDatabase = { [DB in keyof Database]: FlattenObject<Database[DB]>; };

/* https://github.com/blazejkustra/dynamode/blob/fd3abf1e420612811c3eba96ec431e00c28b2783/lib/utils/types.ts#L10
   Flatten entity  */
type FlattenObject<TValue> = CollapseEntries<CreateObjectEntries<TValue, TValue>>;

type Entry = { key: string; value: unknown };
type EmptyEntry<TValue> = { key: ''; value: TValue };
type ExcludedTypes = Date | Set<unknown> | Map<unknown, unknown> | Array<unknown>;
type ArrayEncoder = `[${bigint}]`;

type EscapeArrayKey<TKey extends string> = TKey extends `${infer TKeyBefore}.${ArrayEncoder}${infer TKeyAfter}`
  ? EscapeArrayKey<`${TKeyBefore}${ArrayEncoder}${TKeyAfter}`>
  : TKey;

// Transforms entries to one flattened type
type CollapseEntries<TEntry extends Entry> = { [E in TEntry as EscapeArrayKey<E['key']>]: E['value']; };

// Transforms array type to object
type CreateArrayEntry<TValue, TValueInitial> = OmitItself<
  TValue extends unknown[] ? { [k: ArrayEncoder]: TValue[number] } : TValue,
  TValueInitial
>;

// Omit the type that references itself
type OmitItself<TValue, TValueInitial> = TValue extends TValueInitial
  ? EmptyEntry<TValue>
  : OmitExcludedTypes<TValue, TValueInitial>;

// Omit the type that is listed in ExcludedTypes union
type OmitExcludedTypes<TValue, TValueInitial> = TValue extends ExcludedTypes
  ? EmptyEntry<TValue>
  : CreateObjectEntries<TValue, TValueInitial>;

type CreateObjectEntries<TValue, TValueInitial> = TValue extends object ? {
  // Checks that Key is of type string
  [TKey in keyof TValue]-?: TKey extends string
    ? // Nested key can be an object, run recursively to the bottom
    CreateArrayEntry<TValue[TKey], TValueInitial> extends infer TNestedValue
      ? TNestedValue extends Entry
        ? TNestedValue['key'] extends ''
          ? { key: TKey; value: TNestedValue['value'] }
          : { key: `${TKey}.${TNestedValue['key']}`; value: TNestedValue['value'] } | { key: TKey; value: TValue[TKey] }
        : never
      : never
    : never;
}[keyof TValue] // Builds entry for each key
  : EmptyEntry<TValue>;