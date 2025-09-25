import type {
  Base64String, BaseGuildVoiceChannel, EmbedData, GuildChannel, GuildChannelType, GuildFeature,
  Role, RoleColors, RouteBases
} from 'discord.js';
import type { ISODateTime } from '../globals';

import type { backupId, channelId, guildId, messageId, userId } from './common';

export type backupChannel = {
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
      attachment: `${(typeof RouteBases)['cdn']}/attachments/${channelId}/${messageId}/${string}` & {} | Base64String;
    }[];
    pinned: boolean;
    createdAt: ISODateTime;
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
  bitrate?: number;
  userLimit?: number;
};

export type backups = Record<backupId, {
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
  iconBase64?: Base64String;
  splashBase64?: Base64String;
  bannerBase64?: Base64String;
  systemChannel: GuildChannel['name'];
  systemChannelFlags?: number;
  verificationLevel: number;
  explicitContentFilter: number;
  defaultMessageNotifications: number;
  afk?: {
    name: BaseGuildVoiceChannel['name'];
    timeout: number;
  };
  widget: {
    enabled: boolean | null;
    channel: string | null;
  };
  members?: {
    id: userId;
    username: string;
    discriminator: number;
    nickname: string | null;
    avatarUrl: string;
    bannerUrl: string;
    roles: Role['name'][];
    bot: boolean;
  }[];
  bans: {
    id: userId;
    reason: string;
  }[];
  roles: {
    name: string;
    colors: RoleColors;
    hoist: boolean;
    permissions: `${bigint}`;
    mentionable: boolean;
    position: number;
    isEveryone: boolean;
  }[];
  emojis: ({
    name: string;
  } & ({ url: `${(typeof RouteBases)['cdn']}/emojis/${Snowflake}.png` } | { base64: Base64String }))[];
  stickers: ({
    name: string;
    description: string | null;
    tags: string | null;
  } & ({ url: `${(typeof RouteBases)['cdn']}/stickers/${Snowflake}.png` } | { base64: Base64String }))[];
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
}>;