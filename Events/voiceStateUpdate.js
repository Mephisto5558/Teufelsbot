const
  { EmbedBuilder, PermissionFlagsBits, channelMention, inlineCode, userMention } = require('discord.js'),
  { removeAfkStatus, setAfkStatus } = require('#Utils').afk,
  GRAY = 0x36393F;

/**
 * @this {import('discord.js').ClientEvents['voiceStateUpdate'][0]}
 * @param {import('discord.js').ClientEvents['voiceStateUpdate'][1]} newState */
module.exports = async function voiceStateUpdate(newState) {
  if (this.client.botType == 'dev') return;

  if (this.guild.afkChannel) {
    if (newState.channel?.id != this.guild.afkChannel.id) void removeAfkStatus.call(newState);
    else if (newState.channel.id == this.guild.afkChannel.id) void setAfkStatus.call(newState);
  }

  const setting = this.guild.db.config.logger?.voiceChannelActivity;
  if (!setting?.enabled || this.channelId == newState.channelId) return;

  const channelToSend = this.guild.channels.cache.get(setting.channel);
  if (
    !channelToSend?.isTextBased() || this.guild.members.me.permissionsIn(channelToSend)
      .missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length
  ) return;

  const
    embed = new EmbedBuilder({
      author: { name: newState.member.user.tag, iconURL: newState.member.displayAvatarURL() },
      timestamp: Date.now(),
      color: GRAY
    }),
    lang = this.client.i18n.getTranslator({
      locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPaths: ['events.logger.voiceStateUpdate']
    }),
    oldChannelField = () => (
      { name: lang('oldChannel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: false }
    ),
    newChannelField = () => (
      { name: lang('newChannel'), value: `${channelMention(newState.channel.id)} (${inlineCode(newState.channel.id)})`, inline: false }
    );

  if (!this.channel?.id) {
    embed.data.description = lang('embedDescriptionJoin', { executor: userMention(newState.member.id), newChannel: newState.channel.name });
    embed.data.fields = [newChannelField()];
  }
  else if (newState.channelId) {
    embed.data.description = lang('embedDescriptionMove', {
      executor: userMention(newState.member.id), oldChannel: this.channel.name, newChannel: newState.channel.name
    });
    embed.data.fields = [oldChannelField(), newChannelField()];
  }
  else {
    embed.data.description = lang('embedDescriptionLeave', { executor: userMention(newState.member.id), oldChannel: this.channel.name });
    embed.data.fields = [oldChannelField()];
  }

  return channelToSend.send({ embeds: [embed] });
};