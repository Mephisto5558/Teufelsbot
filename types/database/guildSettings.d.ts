import type { OverwriteType, messageLink } from 'discord.js';
import type { GiveawayData } from 'discord-giveaways';

import type { botSettings } from './botSettings';
import type { Embed, channelId, cmdStats, guildId, messageId, prefixes, roleId, userId } from './common';

export type guildSettings = Record<guildId, {
  position: number;

  /** The date on which the bot left the guild. Is not set if the bot is in the guild. */
  leftAt?: Date;
  config: {
    lang?: botSettings['defaultGuild']['config']['lang'];
    prefixes?: Record<string, prefixes>;
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
    }>;
  };
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
  }>;
  triggers?: Record<`${number}`, {
    trigger: string;
    response: string;
    wildcard: boolean;
  }>;
  channelMinigames?: {
    counting?: Record<channelId, {
      lastNumber: 0;
      highScore?: number;
    } | {
      lastNumber: number;
      lastAuthor: userId;
      highScore?: number;
    }>;

    /** The hightest number ever counted in any counting channel in this guild. */
    countingHighScore?: number;
    wordchain?: Record<channelId, {
      chainedWords: number;

      /**
       * There will always be both `lastWord` and `lastAuthor` or none of them present.
       * Will always be a single lowercase character */
      lastWord?: Lowercase<string>;

      /** The last word of the message before the `lastWord` */
      lastWordBefore?: Lowercase<string>;

      /** There will always be both `lastWordChar` and `lastAuthor` or none of them present. */
      lastAuthor?: userId;
    }>;
  };
  lastMentions?: Record<userId, {
    content: string;
    url: ReturnType<typeof messageLink<channelId, messageId, guildId>>;
    author: userId;
    channel: channelId;
    createdAt: Date;
  }>;
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
  lockedChannels?: Record<channelId, Record<Snowflake, OverwriteType>>;
  minigames?: {
    rps: Record<messageId, {
      player1?: 'rock' | 'paper' | 'scissors';
      player2?: 'rock' | 'paper' | 'scissors';
      startedAt: number;
    }>;
    [gameName: string]: Record<messageId, unknown>;
  };
  tickets?: {
    buttonLabel: string;
    channel: channelId;
  };
  serverbackup?: {
    allowedToLoad?: number;
  };
  cmdStats?: cmdStats;
  wordCounter?: {
    enabled: boolean;
    enabledAt?: Date;
    sum: number;
    channels: Record<channelId, number>;
    members: Record<userId, {
      sum: number;
      channels: Record<channelId, number>;
    }>;
  };
}>;