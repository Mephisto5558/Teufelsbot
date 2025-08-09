import type { Base64String, BaseGuildVoiceChannel, EmbedData, GuildChannel, GuildChannelType, GuildFeature, Role } from 'discord.js';
import type { ISODateTime } from '../globals';

import type { backupId, guildId, userId } from './common';

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
      attachment: `https://cdn.discordapp.com/attachments/${Snowflake}/${Snowflake}/${string}` & {} | Base64String;
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
    userId: userId;
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
}>;