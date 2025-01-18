const
  { ChannelType, OverwriteType, Constants, GuildFeature, AttachmentBuilder, DiscordAPIError } = require('discord.js'),
  fetch = import('node-fetch').then(e => e.default),

  /** @type {import('.')['DiscordAPIErrorCodes']} */
  DiscordAPIErrorCodes = require('../Utils/DiscordAPIErrorCodes.json'),
  { pinnedMessagesMaxAmt } = require('./constants'),
  maxMessagesPerChannelLimit = 100;

/** @type {import('.').BackupSystem.Utils['fetchToBase64']} */
async function fetchToBase64(url) {
  if (url) return (await (await fetch)(url)).arrayBuffer().then(e => Buffer.from(e).toString('base64'));
}

/** @type {import('.').BackupSystem.Utils['loadFromBase64']} */
function loadFromBase64(base64Str) {
  if (base64Str) return Buffer.from(base64Str, 'base64');
}

/** @type {import('.').BackupSystem.Utils['fetchCategoryChildren']} */
async function fetchCategoryChildren(category, saveImages, maxMessagesPerChannel) {
  return Promise.all(category.children.cache
    .sort((a, b) => a.position - b.position)
    .map(async child => {
      if (Constants.TextBasedChannelTypes.includes(child.type) && !Constants.ThreadChannelTypes.includes(child.type))
        return fetchTextChannelData(child, saveImages, maxMessagesPerChannel);

      let channelData = { type: child.type, name: child.name, position: child.position, permissions: fetchChannelPermissions(child) };

      if (Constants.VoiceBasedChannelTypes.includes(child.type)) {
        channelData.bitrate = child.bitrate;
        channelData.userLimit = child.userLimit;
      }

      if (child.type == ChannelType.GuildForum) {
        channelData = {
          ...channelData,
          nsfw: child.nsfw,
          topic: child.topic,
          defaultAutoArchiveDuration: child.defaultAutoArchiveDuration,
          defaultForumLayout: child.defaultForumLayout,
          defaultReactionEmoji: child.defaultReactionEmoji.name,
          defaultSortOrder: category.defaultSortOrder,
          defaultThreadRateLimitPerUser: category.defaultThreadRateLimitPerUser,
          threads: await fetchChannelThreads(child, saveImages, maxMessagesPerChannel),
          availableTags: child.availableTags.map(e => ({ name: e.name, emoji: e.emoji?.name, moderated: e.moderated }))
        };
      }
      else log.warn(`BackupSystem: Unhandled Channel type "${ChannelType[child.type]}" (${child.type})!`);

      return channelData;
    }));
}

/** @type {import('.').BackupSystem.Utils['fetchChannelMessages']} */
async function fetchChannelMessages(channel, saveImages, maxMessagesPerChannel = 10) {
  const messages = await channel.messages.fetch({ limit: Number.isNaN(Number.parseInt(maxMessagesPerChannel)) ? 10 : maxMessagesPerChannel.limit({ min: 1, max: maxMessagesPerChannelLimit }) });

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

/** @type {import('.').BackupSystem.Utils['fetchChannelPermissions']} */
function fetchChannelPermissions(channel) {
  return channel.permissionOverwrites.cache.reduce((acc, e) => {
    if (e.type != OverwriteType.Role) return acc;

    const role = channel.guild.roles.cache.get(e.id);
    if (role)
      acc.push({ name: role.name, allow: e.allow.bitfield.toString(), deny: e.deny.bitfield.toString() });

    return acc;
  }, []);
}

/** @type {import('.').BackupSystem.Utils['fetchChannelThreads']} */
async function fetchChannelThreads(channel, saveImages, maxMessagesPerChannel) {
  /** @type {import('discord.js').ThreadChannel[] | undefined} */
  const threads = (await channel.threads?.fetch())?.threads;

  return threads?.map(async e => ({
    type: e.type,
    name: e.name,
    archived: e.archived,
    autoArchiveDuration: e.autoArchiveDuration,
    locked: e.locked,
    rateLimitPerUser: e.rateLimitPerUser,
    messages: await fetchChannelMessages(e, saveImages, maxMessagesPerChannel).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; })
  })) ?? [];
}

/** @type {import('.').BackupSystem.Utils['fetchMessageAttachments']} */
async function fetchMessageAttachments(message, saveImages) {
  return (await Promise.all(message.attachments.map(async ({ name, url }) => ({
    name, attachment: saveImages ? await fetchToBase64(url) : url
  })))).filter(e => !!e.attachment);
}

/** @type {import('.').BackupSystem.Utils['fetchTextChannelData']} */
async function fetchTextChannelData(channel, saveImages, maxMessagesPerChannel) {
  return {
    type: channel.type,
    name: channel.name,
    nsfw: channel.nsfw,
    isNews: channel.type == ChannelType.GuildAnnouncement,
    rateLimitPerUser: channel.type == ChannelType.GuildText ? channel.rateLimitPerUser : undefined,
    topic: channel.topic,
    permissions: fetchChannelPermissions(channel),
    messages: await fetchChannelMessages(channel, saveImages, maxMessagesPerChannel).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; }),
    threads: await fetchChannelThreads(channel, saveImages, maxMessagesPerChannel)
  };
}

/** @type {import('.').BackupSystem.Utils['loadChannel']} */
async function loadChannel(channel, guild, category, maxMessagesPerChannel, allowedMentions) {
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
  else if (Constants.VoiceBasedChannelTypes.includes(channel.type)) {
    createOptions.bitrate = Math.min(channel.bitrate, guild.maximumBitrate);
    createOptions.userLimit = channel.userLimit;
  }

  const newChannel = await guild.channels.create(createOptions);
  if (Constants.TextBasedChannelTypes.includes(channel.type)) {
    /** @type {import('discord.js').Webhook | undefined} */
    let webhook;
    if (channel.messages.length > 0) {
      try { webhook = await loadChannelMessages(newChannel, channel.messages, undefined, maxMessagesPerChannel, allowedMentions); }
      catch (err) {
        if (!(err instanceof DiscordAPIError)) throw err;
      }
    }

    for (const threadData of channel.threads) {
      const thread = await newChannel.threads.create({ name: threadData.name, autoArchiveDuration: threadData.autoArchiveDuration });
      if (webhook) await loadChannelMessages(thread, threadData.messages, webhook, maxMessagesPerChannel, allowedMentions);
    }
  }

  return newChannel;
}

/** @type {import('.').BackupSystem.Utils['loadChannelMessages']} */
async function loadChannelMessages(channel, messages, webhook, maxMessagesPerChannel, allowedMentions) {
  try { webhook ??= await channel.createWebhook({ name: 'MessagesBackup', avatar: channel.client.user.displayAvatarURL() }); }
  catch (err) {
    if (![DiscordAPIErrorCodes.MaximumNumberOfWebhooksReached, DiscordAPIErrorCodes.MaximumNumberOfWebhooksPerGuildReached].includes(err.code))
      throw err;
  }

  if (!webhook) return;

  for (const msg of messages.filter(e => e.content.length > 0 || e.embeds.length > 0 || e.attachments.length > 0).reverse().slice(-maxMessagesPerChannel)) {
    try {
      const sentMsg = await webhook.send({
        allowedMentions,
        content: msg.content.length ? msg.content : undefined,
        username: msg.username,
        avatarURL: msg.avatar,
        embeds: msg.embeds,
        files: msg.attachments.map(e => new AttachmentBuilder(e.attachment, { name: e.name })),
        threadId: channel.isThread() ? channel.id : undefined
      });

      if (msg.pinned && sentMsg.pinnable && (await channel.messages.fetchPinned()).size < pinnedMessagesMaxAmt) await sentMsg.pin();
    }
    catch (err) { log.error('Backup load error:', err); }
  }

  return webhook;
}

module.exports = {
  fetchToBase64,
  fetchCategoryChildren,
  fetchChannelMessages,
  fetchChannelPermissions,
  fetchChannelThreads,
  fetchMessageAttachments,
  fetchTextChannelData,
  loadChannel,
  loadChannelMessages,
  loadFromBase64
};