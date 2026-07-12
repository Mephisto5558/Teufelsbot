import {
  AttachmentBuilder, BaseGuildVoiceChannel, ChannelType, Constants,
  DiscordAPIError, ForumChannel, GuildFeature, OverwriteType
} from 'discord.js';
import DiscordAPIErrorCodes from './DiscordAPIErrorCodes.json' with { type: 'json' };

import type {
  APIAllowedMentions, AnyThreadChannel, BaseGuildTextChannel, CategoryChannel, Guild, GuildChannel, GuildChannelManager,
  GuildTextBasedChannel, Message, Webhook, WebhookType
} from 'discord.js';
import type { backupChannel } from '../types/database/index.ts';


const maxMessagesPerChannelLimit = 100;

export async function fetchToBase64<T extends string | undefined>(url?: T): Promise<T extends undefined ? undefined : string> {
  return url ? (await (await fetch(url)).bytes()).toBase64() : undefined;
}

export function loadFromBase64<T extends string | undefined>(base64Str?: T): T extends undefined ? undefined : Buffer<ArrayBuffer> {
  if (!base64Str) return;
  const { buffer } = Uint8Array.fromBase64(base64Str);
  return Buffer.from(buffer, buffer.byteOffset, buffer.byteLength);
}

export async function fetchCategoryChildren(
  category: CategoryChannel, saveImages: boolean, maxMessagesPerChannel: number
): Promise<backupChannel[]> {
  return Promise.all(category.children.cache
    .sort((a, b) => a.position - b.position)
    .map(async child => {
      if (Constants.TextBasedChannelTypes.includes(child.type) && !Constants.ThreadChannelTypes.includes(child.type))
        return fetchTextChannelData(child, saveImages, maxMessagesPerChannel);

      let channelData = { type: child.type, name: child.name, position: child.position, permissions: fetchChannelPermissions(child) };

      if (child instanceof BaseGuildVoiceChannel) {
        channelData.bitrate = child.bitrate;
        channelData.userLimit = child.userLimit;
      }

      if (child instanceof ForumChannel) {
        channelData = {
          ...channelData,
          nsfw: child.nsfw,
          topic: child.topic,
          defaultAutoArchiveDuration: child.defaultAutoArchiveDuration,
          defaultForumLayout: child.defaultForumLayout,
          defaultReactionEmoji: child.defaultReactionEmoji.name,
          defaultSortOrder: child.defaultSortOrder,
          defaultThreadRateLimitPerUser: child.defaultThreadRateLimitPerUser,
          threads: await fetchChannelThreads(child, saveImages, maxMessagesPerChannel),
          availableTags: child.availableTags.map(e => ({ name: e.name, emoji: e.emoji?.name, moderated: e.moderated }))
        };
      }
      else log.warn(`BackupSystem: Unhandled Channel type "${ChannelType[child.type]}" (${child.type})!`);

      return channelData;
    }));
}

export async function fetchChannelMessages(
  channel: GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel = 10
): Promise<backupChannel['messages']> {
  const messages = await channel.messages.fetch({
    limit: maxMessagesPerChannel == undefined
      ? 10
      : maxMessagesPerChannel.limit({ min: 1, max: maxMessagesPerChannelLimit })
  });

  return Promise.all(
    messages.filter(e => e.author).map(async e => ({
      username: e.author.username,
      avatar: e.author.avatarURL(),
      content: e.cleanContent,
      embeds: e.embeds.map(e => e.data),
      attachments: await fetchMessageAttachments(e, saveImages),
      pinned: e.pinned,
      createdAt: e.createdAt.toISOString()
    }))
  );
}

export function fetchChannelPermissions(channel: GuildChannel): backupChannel['permissions'] {
  return channel.permissionOverwrites.cache.reduce((acc, e) => {
    if (e.type != OverwriteType.Role) return acc;

    const role = channel.guild.roles.cache.get(e.id);
    if (role)
      acc.push({ name: role.name, allow: e.allow.bitfield.toString(), deny: e.deny.bitfield.toString() });

    return acc;
  }, []);
}

export async function fetchChannelThreads(
  channel: GuildChannel | GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel: number
): Promise<backupChannel['threads']> {
  if (!('threads' in channel)) return [];

  return (await channel.threads.fetch()).threads.map(async e => ({
    type: e.type,
    name: e.name,
    archived: e.archived,
    autoArchiveDuration: e.autoArchiveDuration,
    locked: e.locked,
    rateLimitPerUser: e.rateLimitPerUser,
    messages: await fetchChannelMessages(e, saveImages, maxMessagesPerChannel).catch(err => {
      if (err instanceof DiscordAPIError) return;
      throw err;
    })
  }));
}

export async function fetchMessageAttachments(message: Message, saveImages: boolean): Promise<backupChannel['messages'][number]['attachments']> {
  return (await Promise.all(message.attachments.map(async ({ name, url }) => ({
    name, attachment: saveImages ? await fetchToBase64(url) : url
  })))).filter(e => !!e.attachment);
}

export async function fetchTextChannelData(
  channel: BaseGuildTextChannel, saveImages: boolean, maxMessagesPerChannel: number
): Promise<backupChannel> {
  return {
    type: channel.type,
    name: channel.name,
    nsfw: channel.nsfw,
    isNews: channel.type == ChannelType.GuildAnnouncement,
    rateLimitPerUser: channel.rateLimitPerUser,
    topic: channel.topic,
    permissions: fetchChannelPermissions(channel),
    messages: await fetchChannelMessages(channel, saveImages, maxMessagesPerChannel).catch(err => {
      if (err instanceof DiscordAPIError) return;
      throw err;
    }),
    threads: await fetchChannelThreads(channel, saveImages, maxMessagesPerChannel)
  };
}

export async function loadChannel(
  channel: backupChannel, guild: Guild, category: string, maxMessagesPerChannel: number,
  allowedMentions: APIAllowedMentions
): ReturnType<GuildChannelManager['create']> {
  const createOptions = {
    name: channel.name,
    type: channel.type == ChannelType.GuildAnnouncement && !guild.features.includes(GuildFeature.Community) ? ChannelType.GuildText : channel.type,
    parent: category,
    permissionOverwrites: channel.permissions.reduce((acc, e) => {
      const role = guild.roles.cache.find(e2 => e2.name == e.name);
      if (role) acc.push({ id: role.id, allow: BigInt(e.allow), deny: BigInt(e.deny) });
      return acc;
    }, [])
  };

  if (Constants.TextBasedChannelTypes.includes(channel.type) && !Constants.ThreadChannelTypes.includes(channel.type)) {
    createOptions.topic = channel.topic;
    createOptions.nsfw = channel.nsfw;
    createOptions.rateLimitPerUser = channel.rateLimitPerUser;
  }
  else if (Constants.VoiceBasedChannelTypes.includes(channel.type) && 'bitrate' in channel) {
    createOptions.bitrate = Math.min(channel.bitrate, guild.maximumBitrate);
    createOptions.userLimit = channel.userLimit;
  }

  const newChannel = await guild.channels.create(createOptions);
  if (Constants.TextBasedChannelTypes.includes(channel.type)) {
    let webhook;
    if (channel.messages.length) {
      try { webhook = await loadChannelMessages(newChannel, channel.messages, undefined, maxMessagesPerChannel, allowedMentions); }
      catch (err) {
        if (!(err instanceof DiscordAPIError)) throw err;
      }
    }

    for (const threadData of channel.threads) {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access -- this is fine due to `newChannel.type` always being the same type as `channel.type` */
      const thread = await newChannel.threads.create({ name: threadData.name, autoArchiveDuration: threadData.autoArchiveDuration });

      /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        -- this is fine due to `newChannel.type` always being the same type as `channel.type` */
      if (webhook) await loadChannelMessages(thread, threadData.messages, webhook, maxMessagesPerChannel, allowedMentions);
    }
  }

  return newChannel;
}

export async function loadChannelMessages<WEBHOOK extends Webhook = Webhook<WebhookType.Incoming>, T extends WEBHOOK | undefined>(
  channel: GuildTextBasedChannel | AnyThreadChannel, messages: backupChannel['messages'], webhook: T,
  maxMessagesPerChannel: number, allowedMentions: APIAllowedMentions
): Promise<T extends WEBHOOK ? T : WEBHOOK | undefined> {
  if (!('createWebhook' in channel)) return; // TODO: implement for ThreadChannels and others

  try { webhook ??= await channel.createWebhook({ name: 'MessagesBackup', avatar: channel.client.user.displayAvatarURL() }); }
  catch (err) {
    if (
      !(err instanceof DiscordAPIError)
      || ![DiscordAPIErrorCodes.MaximumNumberOfWebhooksReached, DiscordAPIErrorCodes.MaximumNumberOfWebhooksPerGuildReached].includes(err.code)
    ) throw err;
  }

  if (!webhook) return;

  for (const msg of messages
    .filter(e => e.content.length || e.embeds.length || e.attachments.length)
    .toReversed().slice(-maxMessagesPerChannel)
  ) {
    try {
      const sentMsg = await webhook.send({
        allowedMentions,
        content: msg.content.length ? msg.content : undefined,
        username: msg.username,
        avatarURL: msg.avatar,
        embeds: msg.embeds,
        files: msg.attachments.map(e => new AttachmentBuilder(e.attachment, { name: e.name })),

        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- see to-do at start of the function */
        threadId: channel.isThread() ? channel.id : undefined
      });

      if (msg.pinned && sentMsg.pinnable) await sentMsg.pin();
    }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.MaximumNumberOfPinsReachedForTheChannel) log.error('Backup load error:', err);
    }
  }

  return webhook;
}