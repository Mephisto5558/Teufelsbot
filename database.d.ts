/* eslint-disable max-lines */
import type { Snowflake, ActivityType, GuildFeature, EmbedData } from 'discord.js';
import type { __local } from './globals';
import type { GiveawayData } from 'discord-giveaways';
import type { Database as WebsiteDB } from '@mephisto5558/bot-website/database';

export { Database, FlattenedDatabase, FlattenObject };

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

/** `unknown` are commands that were executed before slash and prefix command stats got counted separately.*/
type cmdStats = { [commandName: string]: Record<'slash' | 'prefix' | 'unknown', number | undefined> | undefined };

type guildId = Snowflake;
type channelId = Snowflake;
type messageId = Snowflake;
type userId = Snowflake;
type roleId = Snowflake;

/** `excludeUndefined` removes ` | undefined` on `userSettings[id]`, `guildSettings[id]`, etc.*/
type Database<excludeUndefined extends boolean = false> = {
  botSettings: {
    startCount: {
      [environment: string]: number | undefined;
    };
    env?: __local.Env;
    activity?: {
      name: string;
      type: ActivityType;
    };
    cmdStats: cmdStats;
    blacklist?: userId[];

    patreonBonuses?: Record<string, unknown>;
    lastFileClear?: Date;
    lastBirthdayCheck?: Date;
    lastDBCleanup?: Date;
  };

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
    } | (excludeUndefined extends true ? never : undefined);
  };

  userSettings: {
    [userId: userId]: {
      customName?: string;
      afkMessage?: {
        message: string;
        createdAt: Date;
      };
      birthday?: Date;
      lastVoted?: Exclude<WebsiteDB['userSettings'][''], undefined>['lastVoted'];
      featureRequestAutoApprove?: Exclude<WebsiteDB['userSettings'][''], undefined>['featureRequestAutoApprove'];
      lastFeatureRequested?: number;
      cmdStats?: cmdStats;
    } | (excludeUndefined extends true ? never : undefined);
  };

  guildSettings: {
    default: {
      config: {
        lang: string;
        prefix: string;
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

      /** The date on which the bot left the guild. Is not set if the bot is in the guild.*/
      leftAt?: Date;
      config: {
        lang?: string;
        prefix?: {
          prefix?: string;
          caseinsensitive?: boolean;
        };
        betaBotPrefix?: {
          prefix?: string;
          caseinsensitive?: boolean;
        };
        logger?: Record<'messageUpdate' | 'messageDelete' | 'voiceChannelActivity' | 'sayCommandUsed' | 'all', {
          channel: channelId;
          enabled: boolean;
        } | undefined>;
        autopublish?: boolean;
        commands?: {
          [commandName: string]: {
            disabled: {
              users?: (userId | '*')[];
              channels?: (channelId | '*')[];
              roles?: (roleId | '*')[];
            };
          } | undefined;
        };
      };
      customNames?: {
        [userId: userId]: string | undefined;
      };
      giveaway?: {
        reaction?: string;
        embedColor?: number;
        embedColorEnd?: number;
        useLastChance?: boolean;
        giveaways: {
          [messageId: messageId]: ThisType<GiveawayData>;
        };
      };
      afkMessages?: {
        [userId: userId]: {
          message: string;
          createdAt: Date;
        } | undefined;
      };
      triggers?: {
        [id: `${number}`]: {
          trigger: string;
          response: string;
          wildcard: boolean;
        } | undefined;
      };
      channelMinigames?: {
        counting?: {
          [channelId: channelId]: {
            lastNumber: number;

            /** `undefined` only if lastNumber is `0` */
            lastAuthor?: userId;
          } | undefined;
        };
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
      cmdStats?: cmdStats;
    } | (excludeUndefined extends true ? never : undefined);
  };

  polls: {
    [guildId: guildId]: userId | (excludeUndefined extends true ? never : undefined);
  };

  backups: {
    [backupId: `${guildId}${Snowflake}`]: {
      id: `${guildId}${Snowflake}`;
      metadata: [userId | userId[]];

      /** Backup creation date */
      createdAt: Date;
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
    } | (excludeUndefined extends true ? never : undefined);
  };

  website: WebsiteDB['website'];
} ;

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