const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

/**@this import('discord.js').VoiceState old state @param {import('discord.js').VoiceState}newState*/
module.exports = async function voiceStateUpdate(newState) {
  const setting = this.guild?.db.config?.logger?.voiceChannelActivity ?? {};
  if (this.client.botType == 'dev' || !this.guild || !setting.enabled || !setting.channel || this.channelId == newState.channelId) return;

  /**@type {import('discord.js').GuildTextBasedChannel | null}*/
  const channel = this.guild.channels.cache.get(setting.channel);
  if (!channel || this.guild.members.me.permissionsIn(channel).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length) return;

  const
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config?.lang ?? this.guild.localeCode, backupPath: 'events.logger.voiceStateUpdate' }),
    embed = new EmbedBuilder({
      author: { name: newState.member.user.tag, iconURL: newState.member.displayAvatarURL() },
      timestamp: Date.now(),
      color: 3553599,
    });

  if (!this.channel?.id) {
    embed.data.description = lang('embedDescriptionJoin', { executor: `<@${newState.member.id}>`, newChannel: newState.channel.name });
    embed.data.fields = [{ name: lang('newChannel'), value: `<#${newState.channel.id}> (\`${newState.channel.id}\`)`, inline: false }];
  }
  else if (!newState.channelId) {
    embed.data.description = lang('embedDescriptionLeave', { executor: `<@${newState.member.id}>`, oldChannel: this.channel?.name || lang('unknown') });
    if (this.channel?.id) embed.data.fields = [{ name: lang('oldChannel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false }];
  }
  else {
    embed.data.description = lang('embedDescriptionMove', { executor: `<@${newState.member.id}>`, oldChannel: this.channel?.name || lang('unknown'), newChannel: newState.channel.name });
    embed.data.fields = [{ name: lang('newChannel'), value: `<#${newState.channel.id}> (\`${newState.channel.id}\`)`, inline: false }];
    if (this.channel?.id) embed.data.fields.splice(0, 0, { name: lang('oldChannel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false });
  }

  return channel.send({ embeds: [embed] });
};