/**
 * @import { ActionRow, ButtonComponent } from 'discord.js'
 * @import { record_startRecording, record_recordControls } from '.' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, DiscordAPIError, PermissionFlagsBits, channelMention, userMention } = require('discord.js'),
  { createWriteStream } = require('node:fs'),
  { access, mkdir, unlink } = require('node:fs/promises'),
  { EndBehaviorType, VoiceConnectionStatus, entersState, getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice'),
  /** @type {string?} */ ffmpegPath = require('ffmpeg-static'),
  { Decoder } = require('prism-media').opus,
  shellExec = require('../shellExec');

if (!ffmpegPath) throw new Error('Missing ffmpeg installation');

/** @type {record_startRecording} */
module.exports.startRecording = async function startRecording(lang, requesterId, voiceChannelId, isPublic, vcCache) {
  const embed = this.message.embeds[0];

  if (!vcCache.length) {
    embed.data.description = lang('denied');
    return this.editReply({ content: '', embeds: [embed], components: [] });
  }

  const voiceChannel = this.guild.channels.cache.get(voiceChannelId);
  if (!voiceChannel) return this.editReply(lang('needVoiceChannel'));

  if (this.guild.members.me.voice.serverDeaf) {
    if (this.guild.members.me.permissionsIn(voiceChannel).missing(PermissionFlagsBits.DeafenMembers).length) {
      embed.data.description = lang('deaf');
      return this.message.edit({ embeds: [embed], components: [] });
    }

    await this.guild.members.me.voice.setDeaf(false, `Record start command, member ${this.guild.members.cache.get(requesterId).user.tag}`);
  }

  embed.data.description = lang('global.loading', this.client.application.getEmoji('loading'));
  embed.data.color = Colors.Green;

  void this.message.edit({ content: '', embeds: [embed], components: [] });

  const
    connection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: this.guildId,
      selfDeaf: false,
      selfMute: true,
      adapterCreator: this.guild.voiceAdapterCreator
    }),
    connectionTimeout = 2e4;

  try { await entersState(connection, VoiceConnectionStatus.Ready, connectionTimeout); }
  catch (err) {
    if (!(err instanceof DiscordAPIError)) throw err;

    // this is here to get error codes that may happen, to add them to the throw condition
    log.error('record_manage Util | enterState error', JSON.stringify(err));
    embed.data.description = lang('cantConnect');
    return this.message.edit({ embeds: [embed] });
  }

  const
    membersToRecord = vcCache.filter(e => e.allowed).map(e => e.userId),
    filename = `${this.message.createdTimestamp}_${voiceChannelId}_${membersToRecord.join('_')}`,
    component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `record.pause.${requesterId}.${voiceChannelId}.${isPublic}`,
          label: lang('pause'),
          style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
          customId: `record.stop.${requesterId}.${voiceChannelId}.${isPublic}`,
          label: lang('stop'),
          style: ButtonStyle.Danger
        })
      ]
    });

  embed.data.description = lang('recording', { channel: channelMention(voiceChannelId), users: membersToRecord.map(userMention).join(', ') });
  void this.message.edit({ embeds: [embed], components: [component] });

  await mkdir('./VoiceRecords/raw', { recursive: true });

  for (const userId of membersToRecord) {
    connection.receiver
      .subscribe(userId, { end: { behavior: EndBehaviorType.Manual } })
      .pipe(new Decoder())
      .pipe(createWriteStream(`./VoiceRecords/raw/${filename}.ogg`, { flags: 'a' }));
  }
};

/** @type {record_recordControls} */
module.exports.recordControls = async function recordControls(lang, mode, voiceChannelId, isPublic, cache) {
  const
    embed = this.message.embeds[0],

    /** @type {ActionRow<ButtonComponent>} */
    buttons = this.message.components[0],
    membersToRecord = cache.get(this.guild.id)?.get(voiceChannelId)?.filter(e => e.allowed)
      .map(e => e.userId);

  if (!membersToRecord) {
    embed.data.description = lang('notFound');
    embed.data.color = Colors.Red;
    return this.update({ embeds: [embed], components: [] });
  }
  if (!membersToRecord.includes(this.user.id)) return this.update(lang('global.noPermUser'));

  const filename = `${this.message.createdTimestamp}_${voiceChannelId}_${membersToRecord.join('_')}`;

  if (mode == 'pause') {
    const { deaf } = this.guild.members.me.voice;

    await this.guild.members.me.voice.setDeaf(!deaf, `voice record pause/resume button, member ${this.user.tag}`);

    if (deaf) {
      embed.data.description = lang('recording', { channel: voiceChannelId, users: membersToRecord.map(userMention).join(', ') });
      embed.data.color = Colors.Green;
      buttons.components[0].data.label = lang('pause');
    }
    else {
      embed.data.description = lang('paused', channelMention(voiceChannelId));
      embed.data.color = Colors.Red;
      buttons.components[0].data.label = lang('resume');
    }

    return this.update({ embeds: [embed], components: [buttons] });
  }

  if (mode == 'stop') {
    getVoiceConnection(this.guild.id).destroy();
    cache.get(this.guild.id).delete(voiceChannelId);
    if (!cache.get(this.guild.id).size) cache.delete(this.guild.id);

    try { await access(`./VoiceRecords/raw/${filename}.ogg`); }
    catch {
      embed.data.description = lang('notFound');
      embed.data.color = Colors.Green;

      return this.update({ embeds: [embed], components: [] });
    }

    embed.data.description = lang('global.loading', this.client.application.getEmoji('loading'));
    void this.update({ embeds: [embed], components: [] });

    await shellExec(`"${ffmpegPath}" -f s16le -ar 48k -ac 2 -i "./VoiceRecords/raw/${filename}.ogg" "./VoiceRecords/${filename}.mp3"`);
    await unlink(`./VoiceRecords/raw/${filename}.ogg`);

    if (isPublic) {
      await this.message.edit({
        content: lang('success'),
        files: [`./VoiceRecords/${filename}.mp3`],
        embeds: []
      });

      return unlink(`./VoiceRecords/${filename}.mp3`);
    }

    buttons.components = [new ButtonBuilder({
      customId: `record.get.${filename}`,
      label: lang('get'),
      style: ButtonStyle.Primary
    })];

    embed.data.description = lang('privateReady');

    return this.message.edit({ embeds: [embed], components: [buttons] });
  }
};