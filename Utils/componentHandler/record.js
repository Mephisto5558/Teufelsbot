const
  { Collection, GuildMember } = require('discord.js'),
  { startRecording, recordControls } = require('./record_manage.js'),

  /**@type {Collection<string, Collection<string, {userId: string, allowed: boolean}[]}*/
  cache = new Collection();

/** this.customId: `record.<mode>.<requesterId>.<voiceChannelId>.<public>`
 * @this import('discord.js').ButtonInteraction @param {lang}lang @param {'memberAllow'|'memberDeny'|'cancel'}mode @param {string}requesterId @param {string}voiceChannelId*/
module.exports = async function record(lang, mode, requesterId, voiceChannelId) {
  lang.__boundArgs__[0].backupPath = 'commands.useful.record';

  switch (mode) {
    case 'memberAllow':
    case 'memberDeny': {
      if (this.member.voice?.channelId != voiceChannelId) return;
      if (!(this.member instanceof GuildMember)) return; //typeguard

      const guildCache = cache.get(this.guild.id) ?? cache.set(this.guild.id, new Collection([[voiceChannelId, []]])).get(this.guild.id);
      const vcCache = guildCache.get(voiceChannelId) ?? guildCache.set(voiceChannelId, []).get(voiceChannelId);

      vcCache.push({ userId: this.user.id, allowed: mode == 'memberAllow' });

      this.reply({ content: lang('updated', lang(mode == 'memberAllow' ? 'allow' : 'deny')), ephemeral: true });

      if (![...this.message.mentions.users.keys()].every(id => vcCache.find(e => e.userId == id))) return;
      return startRecording.call(this, lang, requesterId, voiceChannelId, vcCache);
    }
    case 'cancel': {
      if (this.user.id != requesterId) return;

      cache.get(this.guild.id)?.delete(voiceChannelId);
      if (!cache.get(this.guild.id)?.size) cache.delete(this.guild.id);

      return this.message.edit({ content: lang('canceled'), embeds: [], components: [] });
    }
    case 'pause':
    case 'stop':
      recordControls.call(this, lang, mode, voiceChannelId, cache);
  }
};