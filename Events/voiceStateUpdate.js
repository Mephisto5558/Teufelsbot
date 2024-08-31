const
  { PermissionFlagsBits, EmbedBuilder } = require('discord.js'),
  { removeAfkStatus, setAfkStatus } = require('#Utils').afk;

/**
 * @this {import('discord.js').VoiceState}
 * @param {import('discord.js').VoiceState}newState*/
module.exports = function voiceStateUpdate(newState) {
  if (this.client.botType == 'dev') return;

  if (this.guild.afkChannel) {
    if (newState.channel?.id != this.guild.afkChannel.id) void removeAfkStatus.call(newState);
    else if (newState.channel.id == this.guild.afkChannel.id) void setAfkStatus.call(newState);
  }

  const setting = this.guild.db.config.logger?.voiceChannelActivity;
  if (!setting?.enabled || this.channelId == newState.channelId) return;

  const channelToSend = this.guild.channels.cache.get(setting.channel);
  if (!channelToSend || this.guild.members.me.permissionsIn(channelToSend).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length) return;

  const
    embed = new EmbedBuilder({
      author: { name: newState.member.user.tag, iconURL: newState.member.displayAvatarURL() },
      timestamp: Date.now(),
      color: 0x36393F
    }),

    /** @type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPath: 'events.logger.voiceStateUpdate' }),
    oldChannelField = () => ({ name: lang('oldChannel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false }),
    newChannelField = () => ({ name: lang('newChannel'), value: `<#${newState.channel.id}> (\`${newState.channel.id}\`)`, inline: false });

  if (!this.channel?.id) {
    embed.data.description = lang('embedDescriptionJoin', { executor: `<@${newState.member.id}>`, newChannel: newState.channel.name });
    embed.data.fields = [newChannelField()];
  }
  else if (newState.channelId) {
    embed.data.description = lang('embedDescriptionMove', { executor: `<@${newState.member.id}>`, oldChannel: this.channel.name, newChannel: newState.channel.name });
    embed.data.fields = [oldChannelField(), newChannelField()];
  }
  else {
    embed.data.description = lang('embedDescriptionLeave', { executor: `<@${newState.member.id}>`, oldChannel: this.channel.name });
    embed.data.fields = [oldChannelField()];
  }

  return channelToSend.send({ embeds: [embed] });
};