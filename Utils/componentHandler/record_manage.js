const
  { ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors, PermissionFlagsBits, DiscordAPIError } = require('discord.js'),
  { entersState, joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType, getVoiceConnection } = require('@discordjs/voice'),
  { Decoder } = require('prism-media').opus,
  { createWriteStream } = require('node:fs'),
  { unlink, access, mkdir } = require('node:fs/promises'),
  exec = require('node:util').promisify(require('node:child_process').exec),

  /** @type {string?} */
  ffmpeg = require('ffmpeg-static');

if (!ffmpeg) throw new Error('no ffmpeg');

/**
 * @this {import('discord.js').ButtonInteraction}
 * @param {lang}lang
 * @param {string}requesterId
 * @param {string}voiceChannelId
 * @param {boolean}isPublic
 * @param {{ userId: string, allowed: boolean }[]}vcCache*/
module.exports.startRecording = async function startRecording(lang, requesterId, voiceChannelId, isPublic, vcCache) {
  const embed = this.message.embeds[0];

  if (!vcCache.length) {
    embed.data.description = lang('denied');
    return this.editReply({ content: '', embeds: [embed], components: [] });
  }

  const voiceChannel = this.guild.channels.cache.get(voiceChannelId);
  if (!voiceChannel) return this.editReply(lang('needVoiceChannel'));

  if (this.guild.members.me.voice.serverDeaf) {
    if (this.guild.members.me.permissionsIn(voiceChannel).missing(PermissionFlagsBits.DeafenMembers)) {
      embed.data.description = lang('deaf');
      return this.message.edit({ embeds: [embed], components: [] });
    }

    await this.guild.members.me.voice.setDeaf(false, `Record start command, member ${this.guild.cache.get(requesterId).user.tag}`);
  }

  embed.data.description = lang('global.loading');
  embed.data.color = Colors.Green;

  this.message.edit({ content: '', embeds: [embed], components: [] });

  const connection = joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: this.guildId,
    selfDeaf: false,
    selfMute: true,
    adapterCreator: this.guild.voiceAdapterCreator
  });

  try { await entersState(connection, VoiceConnectionStatus.Ready, 2e4); }
  catch (err) {
    if (!(err instanceof DiscordAPIError)) throw err; // todo: check for specific error codes
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

  embed.data.description = lang('recording', { channel: voiceChannelId, users: `<@${membersToRecord.join('>, <@')}>` });
  this.message.edit({ embeds: [embed], components: [component] });

  try { await access('./VoiceRecords/raw'); }
  catch (err) {
    if (err.code != 'ENOENT') throw err;
    mkdir('./VoiceRecords/raw', { recursive: true });
  }

  for (const userId of membersToRecord) {
    connection.receiver
      .subscribe(userId, { end: { behavior: EndBehaviorType.Manual } })
      .pipe(new Decoder({ channels: 2, rate: 48_000 }))
      .pipe(createWriteStream(`./VoiceRecords/raw/${filename}.ogg`, { flags: 'a' }));
  }
};

/**
 * @this {import('discord.js').ButtonInteraction}
 * @param {lang}lang
 * @param {string}mode
 * @param {string}voiceChannelId
 * @param {boolean}isPublic
 * @param {import('discord.js').Collection<string, import('discord.js').Collection<string, {userId: string, allowed: boolean}[]>>}cache*/
module.exports.recordControls = async function recordControls(lang, mode, voiceChannelId, isPublic, cache) {
  const
    embed = this.message.embeds[0],
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
    const deaf = this.guild.members.me.voice.deaf;

    await this.guild.members.me.voice.setDeaf(!deaf, `voice record pause/resume button, member ${this.user.tag}`);

    if (deaf) {
      embed.data.description = lang('recording', { channel: voiceChannelId, users: `<@${membersToRecord.join('>, <@')}>` });
      embed.data.color = Colors.Green;
      buttons.components[0].data.label = lang('pause');
    }
    else {
      embed.data.description = lang('paused', voiceChannelId);
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

    embed.data.description = lang('global.loading');
    this.update({ embeds: [embed], components: [] });

    await exec(`"${ffmpeg}" -f s16le -ar 48k -ac 2 -i "./VoiceRecords/raw/${filename}.ogg" "./VoiceRecords/${filename}.mp3"`);
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