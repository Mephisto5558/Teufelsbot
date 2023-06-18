const
  { SnowflakeUtil, GatewayIntentBits, ChannelType, OverwriteType, Constants, GuildFeature, AttachmentBuilder, StickerType, Collection } = require('discord.js'),
  fetch = require('node-fetch');

class BackupSystem {
  constructor(db, { dbName = 'backups', maxGuildBackups = 5, maxMessagesPerChannel = 10, saveImages = false, clearGuildBeforeRestore = true } = {}) {
    this.db = db;
    if (!this.db) throw new Error('db is a required argument!');

    this.dbName = dbName;
    if (!this.db.get(this.dbName)) this.db.set(this.dbName, {});

    this.utils = BackupSystem.utils;
    this.defaultSettings = {
      maxGuildBackups: parseInt(maxGuildBackups) || 5,
      maxMessagesPerChannel: parseInt(maxMessagesPerChannel) || 10,
      saveImages,
      clearGuildBeforeRestore
    };
  }

  get = (backupId, guildId) => this.db.get(this.dbName, backupId ? `${(guildId ?? '') + backupId}` : null);

  /**@returns {Collection<string,object>}all backups of a guild or all backups, if no guildId provided.*/
  list = guildId => {
    const collection = new Collection(Object.entries(this.get() || {}));
    return guildId ? collection.filter(e => e?.guildId == guildId) : collection;
  };

  remove = backupId => this.db.delete(this.dbName, backupId);

  /**@param {?object}statusObj the status property gets updated*/
  create = async (guild, {
    statusObj = {}, id = null, save = true, maxGuildBackups = this.defaultSettings.maxGuildBackups,
    backupMembers = false, maxMessagesPerChannel = this.defaultSettings.maxMessagesPerChannel,
    doNotBackup = [], saveImages = this.defaultSettings.saveImages, metadata
  } = {}) => {
    if (!guild.client.options.intents.has(GatewayIntentBits.Guilds)) throw new Error('Guilds intent is required');

    statusObj.status = 'create.settings';

    const updateStatus = status => statusObj.status = status;
    const data = {
      id: id ?? guild.id + SnowflakeUtil.generate().toString(),
      metadata: metadata ?? null,
      createdTimestamp: Date.now(),
      name: guild.name,
      guildId: guild.id,
      locale: guild.preferredLocale,
      features: guild.features,
      iconURL: guild.iconURL(),
      splashURL: guild.splashURL(),
      bannerURL: guild.bannerURL(),
      systemChannel: guild.systemChannel?.name,
      systemChannelFlags: guild.systemChannelFlags.bitfield,
      rulesChannel: guild.rulesChannel?.name,
      updatesChannel: guild.publicUpdatesChannel?.name,
      verificationLevel: guild.verificationLevel,
      explicitContentFilter: guild.explicitContentFilter,
      defaultMessageNotifications: guild.defaultMessageNotifications,
      afk: guild.afkChannel ? { name: guild.afkChannel.name, timeout: guild.afkTimeout } : null,
      widget: {
        enabled: guild.widgetEnabled,
        channel: guild.widgetChannel ? guild.widgetChannel.name : null
      },
      members: backupMembers ? (updateStatus('create.members') && await guild.members.fetch()).map(e => ({
        id: e.id,
        username: e.user.username,
        tag: e.user.tag,
        nickname: e.nickname,
        avatarUrl: e.displayAvatarURL(),
        roles: [...e.roles.cache.map(e => e.name).values()],
        bot: e.user.bot
      })) : [],
      bans: doNotBackup?.includes('bans') ? [] : (updateStatus('create.bans') && await guild.bans.fetch()).map(e => ({ id: e.user.id, reason: e.reason })),
      roles: doNotBackup?.includes('roles') ? [] : (updateStatus('create.roles') && await guild.roles.fetch()).filter(e => !e.managed).sort((a, b) => b.position - a.position).map(e => ({
        name: e.name,
        color: e.color,
        hoist: e.hoist,
        permissions: e.permissions.bitfield.toString(),
        mentionable: e.mentionable,
        position: e.position,
        isEveryone: guild.id == e.id
      })),
      emojis: doNotBackup?.includes('emojis') ? [] : await Promise.all(updateStatus('create.emojis') && (await guild.emojis.fetch()).map(async e => ({
        name: e.name, ...(saveImages ? { base64: await this.utils.fetchToBase64(e.url) } : { url: e.url })
      }))),
      stickers: doNotBackup?.includes('stickers') ? [] : await Promise.all(updateStatus('create.stickers') && (await guild.stickers.fetch()).filter(e => e.type != StickerType.Standard).map(async e => ({
        name: e.name, description: e.description, tags: e.tags, ...(saveImages ? { base64: await this.utils.fetchToBase64(e.url) } : { url: e.url })
      }))),
      channels: doNotBackup?.includes('channels') ? null : {
        categories: await Promise.all(updateStatus('create.channels') && (await guild.channels.fetch()).filter(e => e.type == ChannelType.GuildCategory).sort((a, b) => a.position - b.position).map(async e => ({
          name: e.name,
          permissions: await this.utils.fetchChannelPermissions(e),
          children: await Promise.all(e.children.cache.sort((a, b) => a.position - b.position).map(async child => {
            if (Constants.TextBasedChannelTypes.includes(child.type) && !Constants.ThreadChannelTypes.includes(child.type)) return this.utils.fetchTextChannelData(child, saveImages, maxMessagesPerChannel);
            if (Constants.VoiceBasedChannelTypes.includes(child.type)) return {
              type: child.type,
              name: child.name,
              bitrate: child.bitrate,
              userLimit: child.userLimit,
              position: child.position,
              permissions: await this.utils.fetchChannelPermissions(child)
            };
            if (child.type == ChannelType.GuildForum) return {
              type: child.type,
              name: child.name,
              nsfw: child.nsfw,
              topic: child.topic,
              defaultAutoArchiveDuration: child.defaultAutoArchiveDuration,
              defaultForumLayout: child.defaultForumLayout,
              defaultReactionEmoji: child.defaultReactionEmoji.name,
              defaultSortOrder: e.defaultSortOrder,
              defaultThreadRateLimitPerUser: e.defaultThreadRateLimitPerUser,
              permissions: await this.utils.fetchChannelPermissions(child),
              position: child.position,
              threads: await this.utils.fetchChannelThreads(child, saveImages, maxMessagesPerChannel),
              availableTags: child.availableTags.map(async e => ({ name: e.name, emoji: e.emoji?.name, moderated: e.moderated }))
            };
            log._log('warn', `BackupSystem: Unhandled Channel type "${ChannelType[child.type] ?? child.type}"!`);
          }))
        }))),
        others: await Promise.all(guild.channels.cache
          .filter(e => !e.parent && ![ChannelType.GuildCategory, ...Constants.ThreadChannelTypes].includes(e.type))
          .sort((a, b) => a.position - b.position)
          .map(async e => this.utils.fetchTextChannelData(e, saveImages, maxMessagesPerChannel)))
      }
    };

    statusObj.status = 'create.images';
    if (saveImages) {
      data.iconBase64 = await this.utils.fetchToBase64(guild.iconURL());
      data.splashBase64 = await this.utils.fetchToBase64(guild.splashURL());
      data.bannerBase64 = await this.utils.fetchToBase64(guild.bannerURL());
    }

    if (save) {
      const backups = this.db.get(this.dbName);
      backups[data.id] = data;

      const guildBackups = Object.keys(backups).filter(e => e.startsWith(guild.id));
      if (guildBackups.length > maxGuildBackups) for (const id of guildBackups.sort((a, b) => b - a).slice(0, maxGuildBackups)) await this.db.delete(this.dbName, id);
      else await this.db.update(this.dbName, data.id, data);
    }

    return data;
  };

  /**@param {String|object|null}id Backup Id. If falsely, will use latest. If object, will use object. @param {import('discord.js').Guild}guild @param statusObj the status property gets updated*/
  load = async (id, guild, { statusObj, clearGuildBeforeRestore = this.defaultSettings.clearGuildBeforeRestore, maxMessagesPerChannel = this.defaultSettings.maxMessagesPerChannel, allowedMentions = [], reason = 'Backup Feature | Load' } = {}) => {
    if (!guild) throw new Error('Invalid guild');

    let data, rulesChannel, publicUpdatesChannel;

    if (!id) data = this.list(guild.id).sort((a, b) => b - a).first();
    else data = typeof id == 'string' ? this.get(id) : id;

    if (clearGuildBeforeRestore) {
      statusObj.status = 'clear.items';
      for (const [, item] of [...await guild.channels.fetch(), ...await guild.emojis.fetch(), ...await guild.stickers.fetch(), ...(await guild.roles.fetch()).filter(r => !r.managed && r.editable && r.id != guild.id && !guild.roles.cache.find(e => e.name == r.name && e.editable))])
        try { await item.delete(reason); } catch { }

      statusObj.status = 'clear.bans';
      for (const [, { user }] of (await guild.bans.fetch()).filter(e => !data.bans.find(b => e.user.id == b.id && e.reason == b.reason))) try { await guild.bans.remove(user.id, reason); } catch { }

      statusObj.status = 'clear.settings';
      await guild.edit({
        reason,
        verificationLevel: guild.features.includes(GuildFeature.Community) ? undefined : null,
        explicitContentFilter: guild.features.includes(GuildFeature.Community) ? undefined : null,
        afkTimeout: 300,
        systemChannel: null,
        systemChannelFlags: [],
        preferredLocale: null,
        defaultMessageNotifications: null,
        afkChannel: null,
        icon: data.iconURL ? undefined : null,
        splash: data.splashURL && guild.splash ? undefined : null,
        banner: data.bannerURL && guild.banner ? undefined : null,
      });

      if (data.widget.enabled != guild.widgetEnabled || guild.widgetChannel) await guild.setWidgetSettings({ enabled: false, channel: null }, reason);
    }

    statusObj.status = 'load.settings';
    await guild.edit({
      reason, name: data.name ?? undefined,
      verificationLevel: data.verificationLevel ?? undefined,
      explicitContentFilter: data.explicitContentFilter ?? undefined,
      systemChannelFlags: data.systemChannelFlags ?? undefined,
      preferredLocale: data.locale ?? undefined,
      defaultMessageNotifications: data.defaultMessageNotifications ?? undefined,
      afkTimeout: data.afk.timeout ?? undefined,
      afkChannel: data.afk?.name ? guild.channels.cache.find(e => e.name == data.afk.name && e.type == ChannelType.GuildVoice) : undefined,
      icon: data.iconBase64 ? this.utils.loadFromBase64(data.iconBase64) : data.iconURL,
      splash: data.splashBase64 ? this.utils.loadFromBase64(data.splashBase64) : data.splashURL,
      banner: data.bannerBase64 ? this.utils.loadFromBase64(data.bannerBase64) : data.bannerURL
    });

    if (data.features.includes(GuildFeature.Community)) {
      data.features = data.features.filter(e => e != GuildFeature.Community);
      rulesChannel = guild.rulesChannel ?? await guild.channels.create({ name: 'temp_rules', type: ChannelType.GuildText });
      publicUpdatesChannel = guild.publicUpdatesChannel ?? await guild.channels.create({ name: 'temp_updates', type: ChannelType.GuildText });
      await guild.edit({ features: [...new Set(guild.features, GuildFeature.Community)], rulesChannel, publicUpdatesChannel, reason });
    }

    statusObj.status = 'load.features';
    for (const feature of data.features) try { await guild.edit({ features: [...new Set(guild.features, feature)], reason }); } catch { }

    statusObj.status = 'load.roles';
    for (const { isEveryone, name, color, hoist, permissions, mentionable } of data.roles) {
      const data = { reason, name, color, hoist, mentionable, permissions: BigInt(permissions) };
      await ((isEveryone ? guild.roles.cache.get(guild.id) : guild.roles.cache.find(e => e.name == name && e.editable))?.edit(data) || guild.roles.create(data));
    }

    statusObj.status = 'load.members';
    const members = await guild.members.fetch();
    for (const memberData of data.members) {
      const member = members.get(memberData.id);
      if (!member?.manageable || !memberData.roles.length && !memberData.nickname) continue;

      await member.edit({
        roles: memberData.roles?.map(e => guild.roles.cache.find(r => r.name == e)?.id).filter(e => e?.editable),
        nickname: memberData.nickname ?? undefined
      });
    }

    statusObj.status = 'load.channels';
    for (const category of data.channels?.categories || []) {
      const channel = await guild.channels.create({
        reason, name: category.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: category.permissions.map(e => {
          const role = guild.roles.cache.find(r => r.name == e.name);
          return role ? { id: role.id, allow: BigInt(e.allow), deny: BigInt(e.deny) } : null;
        })
      });

      for (const child of category.children) await this.utils.loadChannel(child, guild, channel, maxMessagesPerChannel, allowedMentions);
    }

    for (const channel of data.channels.others) await this.utils.loadChannel(channel, guild, null, maxMessagesPerChannel, allowedMentions);

    statusObj.status = 'load.emojis';
    for (const emoji of data.emojis) {
      try { await guild.emojis.create({ name: emoji.name, attachment: emoji.url ?? this.utils.loadFromBase64(emoji.base64), reason }); }
      catch { break; }
    }

    statusObj.status = 'load.stickers';
    for (const sticker of data.stickers) {
      try { await guild.stickers.create({ name: sticker.name, description: sticker.description, tags: sticker.tags, file: sticker.url ?? this.utils.loadFromBase64(sticker.base64), reason }); }
      catch { break; }
    }

    statusObj.status = 'load.bans';
    for (const ban of data.bans)
      try { await guild.members.ban(ban.id, { reason: ban.reason }); } catch { }

    if (data.widget.channel) await guild.setWidgetSettings({ enabled: data.widget.enabled, channel: guild.channels.cache.find(e => e.name == data.widget.channel) }, reason);

    if (rulesChannel || publicUpdatesChannel) {
      statusObj.status = 'load.settings';
      const rChannel = guild.channels.cache.find(e => e.name == data.rulesChannel);
      const uChannel = guild.channels.cache.find(e => e.name == data.publicUpdatesChannel);

      await guild.edit({
        rulesChannel: rChannel ?? undefined,
        publicUpdatesChannel: uChannel ?? undefined,
        reason
      });

      if (rulesChannel && rChannel) await guild.channels.delete(rulesChannel, reason);
      if (publicUpdatesChannel && uChannel) await guild.channels.delete(publicUpdatesChannel, reason);
    }

    statusObj.status = 'clear.ownWebhooks';
    for (const [, webhook] of (await guild.fetchWebhooks()).filter(e => e.name == 'MessagesBackup')) await webhook.delete(reason);

    return data;
  };

  static utils = {
    fetchToBase64: async url => url ? (await fetch(url).then(r => r.buffer())).toString('base64') : null,
    loadFromBase64: str => str ? Buffer.from(str, 'base64') : null,
    fetchChannelPermissions: channel => channel.permissionOverwrites.cache.filter(e => e.type == OverwriteType.Role).map(e => {
      const role = channel.guild.roles.cache.get(e.id);
      return role ? ({
        name: role.name,
        allow: e.allow.bitfield.toString(),
        deny: e.deny.bitfield.toString()
      }) : null;
    }),
    fetchTextChannelData: async (channel, saveImages, maxMessagesPerChannel) => ({
      type: channel.type,
      name: channel.name,
      nsfw: channel.nsfw,
      isNews: channel.type == ChannelType.GuildAnnouncement,
      rateLimitPerUser: channel.type == ChannelType.GuildText ? channel.rateLimitPerUser : undefined,
      topic: channel.topic,
      permissions: await this.utils.fetchChannelPermissions(channel),
      messages: await this.utils.fetchChannelMessages(channel, saveImages, maxMessagesPerChannel).catch(() => { }),
      threads: await this.utils.fetchChannelThreads(channel, saveImages, maxMessagesPerChannel)
    }),
    fetchChannelThreads: async (channel, saveImages, maxMessagesPerChannel) => ((await channel.threads?.fetch())?.threads || []).map(async e => ({
      type: e.type,
      name: e.name,
      archived: e.archived,
      autoArchiveDuration: e.autoArchiveDuration,
      locked: e.locked,
      rateLimitPerUser: e.rateLimitPerUser,
      messages: await this.utils.fetchChannelMessages(e, saveImages, maxMessagesPerChannel).catch(() => { }),
    })),
    fetchChannelMessages: async (channel, saveImages, maxMessagesPerChannel) => Promise.all((await channel.messages.fetch({ limit: isNaN(maxMessagesPerChannel) ? 10 : maxMessagesPerChannel.limit({ min: 1, max: 100 }) })).filter(e => e.author).map(async e => ({
      username: e.author.username,
      avatar: e.author.avatarURL(),
      content: e.cleanContent,
      embeds: e.embeds?.map(e => e.data),
      files: (await Promise.all(e.attachments.map(async ({ name, url }) => ({
        name, attachment: saveImages && ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi'].includes(url) ? await this.utils.fetchToBase64(url) : url
      })))).filter(e => e.attachment),
      pinned: e.pinned,
      createdAt: e.createdAt.toISOString(),
    }))),
    loadChannel: async (data, guild, category, maxMessagesPerChannel, allowedMentions) => {
      const createOptions = {
        name: data.name,
        type: data.type == 5 && !guild.features.includes(GuildFeature.Community) ? 0 : data.type,
        parent: category,
        permissionOverwrites: data.permissions.reduce((acc, e) => {
          const role = guild.roles.cache.find(r => r.name == e.name);
          if (role) acc.push({ id: role.id, allow: BigInt(e.allow), deny: BigInt(e.deny) });
          return acc;
        }, [])
      };

      if (Constants.TextBasedChannelTypes.includes(data.type) && !Constants.ThreadChannelTypes.includes(data.type)) {
        createOptions.topic = data.topic;
        createOptions.nsfw = data.nsfw;
        createOptions.rateLimitPerUser = data.rateLimitPerUser;
      }
      else if (Constants.VoiceBasedChannelTypes.includes(data.type)) {
        createOptions.bitrate = data.bitrate > guild.maximumBitrate ? guild.maximumBitrate : data.bitrate;
        createOptions.userLimit = data.userLimit;
      }

      const channel = await guild.channels.create(createOptions);
      if (Constants.TextBasedChannelTypes.includes(data.type)) {
        let webhook;
        if (data.messages.length > 0) try { webhook = await this.utils.loadChannelMessages(channel, data.messages, null, maxMessagesPerChannel, allowedMentions); } catch { }
        for (const threadData of data.threads) {
          const thread = await channel.threads.create({ name: threadData.name, autoArchiveDuration: threadData.autoArchiveDuration });
          if (webhook) await this.utils.loadChannelMessages(thread, threadData.messages, webhook, maxMessagesPerChannel, allowedMentions);
        }
      }

      return channel;
    },
    loadChannelMessages: async (channel, messages, webhook, maxMessagesPerChannel, allowedMentions) => {
      webhook ??= await channel.createWebhook({ name: 'MessagesBackup', avatar: channel.client.user.displayAvatarURL() }).catch(() => { });
      if (!webhook) return;

      for (const msg of messages.filter(m => m.content.length > 0 || m.embeds.length > 0 || m.files.length > 0).reverse().slice(-maxMessagesPerChannel)) try {
        const sentMsg = await webhook.send({
          content: msg.content.length ? msg.content : undefined,
          username: msg.username,
          avatarURL: msg.avatar,
          embeds: msg.embeds,
          files: msg.files.map(f => new AttachmentBuilder(f.attachment, { name: f.name })),
          allowedMentions: allowedMentions,
          threadId: channel.isThread() ? channel.id : undefined
        });

        if (msg.pinned && (await channel.messages.fetchPinned()).size < 50) await sentMsg.pin();
      } catch (err) { log.error('Backup load error:', err); }

      return webhook;
    }
  };
}

module.exports = BackupSystem;