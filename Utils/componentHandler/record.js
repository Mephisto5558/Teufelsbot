const
  { Collection, GuildMember, inlineCode, MessageFlags } = require('discord.js'),
  { startRecording, recordControls } = require('./record_manage.js'),

  /** @type {Collection<Snowflake, Collection<Snowflake, { userId: Snowflake, allowed: boolean }[]>>} */
  cache = new Collection();

/** @type {import('.').record} */
module.exports = async function record(lang, mode, requesterId, voiceChannelId, isPublic) {
  lang.__boundArgs__[0].backupPath[0] = 'commands.premium.record';

  switch (mode) {
    case 'memberAllow':
    case 'memberDeny': {
      if (this.member.voice.channelId != voiceChannelId) return;
      if (!(this.member instanceof GuildMember)) return; // typeguard

      const
        guildCache = cache.get(this.guild.id) ?? cache.set(this.guild.id, new Collection([[voiceChannelId, []]])).get(this.guild.id),
        vcCache = guildCache.get(voiceChannelId) ?? guildCache.set(voiceChannelId, []).get(voiceChannelId);

      if (!guildCache || !vcCache) return; // typeguard
      vcCache.push({ userId: this.user.id, allowed: mode == 'memberAllow' });

      void this.reply({ content: lang('updated', inlineCode(lang(mode == 'memberAllow' ? 'allow' : 'deny'))), flags: MessageFlags.Ephemeral });

      if (!this.message.mentions.users.every((_, id) => vcCache.some(e => e.userId == id))) return;
      return startRecording.call(this, lang, requesterId, voiceChannelId, isPublic == 'true', vcCache);
    }
    case 'cancel':
      if (this.user.id != requesterId) return;

      cache.get(this.guild.id)?.delete(voiceChannelId);
      if (!(cache.get(this.guild.id)?.size ?? 0)) cache.delete(this.guild.id);

      return this.message.edit({ content: lang('canceled'), embeds: [], components: [] });

    case 'get':
      return this.reply({
        content: lang('success'),
        files: [`./VoiceRecords/${requesterId}.mp3`],
        flags: MessageFlags.Ephemeral
      });

    case 'pause':
    case 'stop':
      return recordControls.call(this, lang, mode, voiceChannelId, isPublic == 'true', cache);

    default: throw new Error('Unsupported mode');
  }
};