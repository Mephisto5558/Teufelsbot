/* eslint-disable max-lines */
import type { ActivityType, GuildFeature, EmbedData, OverwriteType, Base64String, GuildChannelType, messageLink } from 'discord.js';
import type { ISODateTime } from './globals';
import type { Env } from './locals';
import type { GiveawayData } from 'discord-giveaways';
import type { Database as WebsiteDB } from '@mephisto5558/bot-website/database';
import type { Locale } from '@mephisto5558/i18n';

export type { Database, FlattenedDatabase, FlattenObject, backupId, backupChannel };

interface Embed {
  title: string;
  description: string;
  color: number;
}

type backupChannel = {
  type: GuildChannelType;
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
    attachments: {
      name: string;
      attachment: `https://cdn.discordapp.com/attachments/${Snowflake}/${Snowflake}/${string}` & {} | Base64String;
    }[];
    pinned: boolean;
    createdAt: `${ISODateTime}`;
  }[];
  isNews: boolean;
  threads: {
    type: number;
    name: string;
    archived: boolean;
    autoArchiveDuration: number;
    locked: boolean;
    rateLimitPerUser: number;
    messages: backupChannel['messages'];
  }[];
};

type guildId = Snowflake;
type channelId = Snowflake;
type messageId = Snowflake;
type userId = Snowflake;
type roleId = Snowflake;
type backupId = `${guildId}${Snowflake}`;

/** `unknown` are commands that were executed before slash and prefix command stats got counted separately. */
type cmdStats = Record<string, Record<'slash' | 'prefix' | 'unknown', number | undefined> | undefined>;

type Database = {
  botSettings: {
    startCount: Record<string, number | undefined>;
    env?: Env;
    activity?: {
      name: string;
      type: ActivityType;
    };
    cmdStats: cmdStats;
    blacklist?: userId[];
    timeEvents: {
      lastFileClear?: Date;
      lastBirthdayCheck?: Date;
      lastDBCleanup?: Date;
      lastEmojiSync?: Date;
      lastVotingReminder?: Date;
    };
    defaultGuild: {
      config: {
        lang: Locale;
        prefixes: { prefix: string; caseinsensitive: boolean }[];
        betaBotPrefixes: { prefix: string; caseinsensitive: boolean }[];
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

    patreonBonuses?: Record<string, unknown>;
  };

  leaderboards: Record<string, Record<userId, {
    wins?: number;
    draws?: number;
    loses?: number;
    games?: number;
    drewAgainst?: Record<userId | 'AI', number>;
    lostAgainst?: Record<userId | 'AI', number>;
    wonAgainst?: Record<userId | 'AI', number>;
    against?: Record<userId | 'AI', number>;
  } | undefined> | undefined>;

  userSettings: Record<userId, {
    localeCode?: Locale;
    customName?: string;
    afkMessage?: {
      message: string;
      createdAt: Date;
    };
    birthday?: Date;
    lastVoted?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['lastVoted'];
    featureRequestAutoApprove?: NonNullable<WebsiteDB['userSettings'][Snowflake]>['featureRequestAutoApprove'];
    lastFeatureRequested?: number;
    votingReminderDisabled?: boolean;
    cmdStats?: cmdStats;
  } | undefined>;

  guildSettings: Record<guildId, {
    position: number;

    /** The date on which the bot left the guild. Is not set if the bot is in the guild. */
    leftAt?: Date;
    config: {
      lang?: Database['botSettings']['defaultGuild']['config']['lang'];
      prefixes?: Database['botSettings']['defaultGuild']['config']['prefixes'];
      betaBotPrefixes?: Database['botSettings']['defaultGuild']['config']['betaBotPrefixes'];
      logger?: Record<'messageUpdate' | 'messageDelete' | 'voiceChannelActivity' | 'sayCommandUsed' | 'all', {
        channel: channelId;
        enabled: boolean;
      } | undefined>;
      autopublish?: boolean;
      commands?: Record<string, {
        disabled: {
          users?: (userId | '*')[];
          channels?: (channelId | '*')[];
          roles?: (roleId | '*')[];
        };
      } | undefined>;
    };
    customNames?: Record<userId, string | undefined>;
    giveaway?: {
      reaction?: string;
      embedColor?: number;
      embedColorEnd?: number;
      useLastChance?: boolean;
      giveaways: Record<messageId, ThisType<GiveawayData>>;
    };
    afkMessages?: Record<userId, {
      message: string;
      createdAt: Date;
    } | undefined>;
    triggers?: Record<`${number}`, {
      trigger: string;
      response: string;
      wildcard: boolean;
    } | undefined>;
    channelMinigames?: {
      counting?: Record<channelId, {
        lastNumber: number;

        /** `undefined` only if lastNumber is `0` */
        lastAuthor?: userId;
      } | undefined>;
      wordchain?: Record<channelId, {
        chainedWords: number;

        /**
         * There will always be both `lastWord` and `lastAuthor` or none of them present.
         * Will always be a single lowercase character */
        lastWord?: string;

        /** The last word of the message before the `lastWord` */
        lastWordBefore?: string;

        /** There will always be both `lastWordChar` and `lastAuthor` or none of them present. */
        lastAuthor?: userId;
      } | undefined>;
    };
    lastMentions?: Record<userId, {
      content: string;
      url: ReturnType<typeof messageLink<channelId, messageId, guildId>>;
      author: userId;
      channel: channelId;
      createdAt: Date;
    } | undefined>;
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
      join?: {
        channel: channelId;
        message: {
          embed?: Embed;
          content?: string;
        };
      };
      leave?: {
        channel: channelId;
        message: {
          embed?: Embed;
          content?: string;
        };
      };
    };
    lockedChannels?: Record<channelId, Record<Snowflake, OverwriteType | undefined> | undefined>;
    minigames?: {
      rps: Record<messageId, {
        player1?: 'r' | 'p' | 's';
        player2?: 'r' | 'p' | 's';
      } | undefined>;
      [gameName: string]: Record<messageId, unknown> | undefined;
    };
    tickets?: {
      buttonLabel: string;
      channel: channelId;
    };
    serverbackup?: {
      allowedToLoad?: number;
    };
    cmdStats?: cmdStats;
  } | undefined>;

  polls: Record<guildId, userId | undefined>;

  backups: Record<backupId, {
    id: backupId;
    metadata: [userId | userId[]];

    /** Backup creation date */
    createdAt: Date;
    name: string;
    guildId: guildId;
    locale: string;
    features: GuildFeature[];
    iconURL: string;
    splashURL: string | null;
    bannerURL: string | null;
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
      enabled: boolean | null;
      channel: string | null;
    };
    members?: {
      userId: userId;
      username: string;
      discriminator: number;
      nickname: string | null;
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
    emojis: ({
      name: string;
    } & ({ url: `https://cdn.discordapp.com/emojis/${Snowflake}.png` } | { base64: Base64String }))[];
    stickers: ({
      name: string;
      description: string | null;
      tags: string | null;
    } & ({ url: `https://cdn.discordapp.com/stickers/${Snowflake}.png` } | { base64: Base64String }))[];
    channels: {
      categories: {
        name: string;
        permissions: {
          name: string;
          allow: `${bigint}`;
          deny: `${bigint}`;
        }[];
        children: backupChannel[];
      }[];

      /** Channels which are not in a category */
      others: backupChannel[];
    };
  } | undefined>;

  website: WebsiteDB['website'];
};

type FlattenedDatabase = { [DB in keyof Database]: FlattenObject<Database[DB]>; };

/* https://github.com/blazejkustra/dynamode/blob/fd3abf1e420612811c3eba96ec431e00c28b2783/lib/utils/types.ts#L10
   Flatten entity  */
type FlattenObject<TValue> = CollapseEntries<CreateObjectEntries<TValue, TValue>>;

type Entry = { key: string; value: unknown };
type EmptyEntry<TValue> = { key: ''; value: TValue };
type ExcludedTypes = Date | Set<unknown> | Map<unknown, unknown> | unknown[];
type ArrayEncoder = `[${bigint}]`;

type EscapeArrayKey<TKey extends string> = TKey extends `${infer TKeyBefore}.${ArrayEncoder}${infer TKeyAfter}`
  ? EscapeArrayKey<`${TKeyBefore}${ArrayEncoder}${TKeyAfter}`>
  : TKey;

// Transforms entries to one flattened type
type CollapseEntries<TEntry extends Entry> = { [E in TEntry as EscapeArrayKey<E['key']>]: E['value']; };

// Transforms array type to object
type CreateArrayEntry<TValue, TValueInitial> = OmitItself<
  TValue extends unknown[] ? Record<ArrayEncoder, TValue[number]> : TValue,
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