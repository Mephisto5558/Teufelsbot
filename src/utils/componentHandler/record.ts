import { Collection, MessageFlags, inlineCode } from 'discord.js';
import { recordControls, startRecording } from './record_manage.ts';
import type { GuildButtonInteraction, Response } from './index.ts';

type ControlElements = 'pause' | 'stop';

const cache = new Collection<Snowflake, Collection<Snowflake, { userId: Snowflake; allowed: boolean }[]>>();

export default async function record<
  MODE extends 'memberAllow' | 'memberDeny' | 'cancel' | ControlElements | 'get',
  REQUESTER_ID extends MODE extends 'get' ? string : Snowflake, VOICE_CHANNEL_ID extends Snowflake, IS_PUBLIC extends `${boolean}`
>(
  this: GuildButtonInteraction<`record.${MODE}.${REQUESTER_ID}.${VOICE_CHANNEL_ID}.${IS_PUBLIC}`>,
  lang: lang, mode: MODE, requesterId: REQUESTER_ID, voiceChannelId: VOICE_CHANNEL_ID, isPublic: IS_PUBLIC
): Promise<Response> {
  lang.config.backupPaths[0] = 'commands.premium.record';

  switch (mode) {
    case 'memberAllow':
    case 'memberDeny': {
      if (this.member.voice.channelId != voiceChannelId) return;

      const
        guildCache = cache.getOrInsertComputed(this.guild.id, () => new Collection([[voiceChannelId, []]])),
        vcCache = guildCache.getOrInsert(voiceChannelId, []);

      vcCache.push({ userId: this.user.id, allowed: mode == 'memberAllow' });

      void this.reply({ content: lang('updated', inlineCode(lang(mode == 'memberAllow' ? 'allow' : 'deny'))), flags: MessageFlags.Ephemeral });

      if (!this.message.mentions.users.every((_, id) => vcCache.some(e => e.userId == id))) return;
      return startRecording.call(this, lang, requesterId, voiceChannelId, isPublic == 'true', vcCache);
    }
    case 'cancel':
      if (this.user.id != requesterId) return;

      cache.get(this.guild.id)?.delete(voiceChannelId);
      if (!cache.get(this.guild.id)?.size) cache.delete(this.guild.id);

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
}