/** @import { ClientEvents } from 'discord.js' */

const
  { EmbedBuilder, channelMention, inlineCode, userMention } = require('discord.js'),
  { Permission } = require('@mephisto5558/command'),
  { removeAfkStatus, setAfkStatus } = require('#Utils').afk;

const GRAY = 0x36393F;

/**
 * @this {ClientEvents['voiceStateUpdate'][0]}
 * @param {ClientEvents['voiceStateUpdate'][1]} updatedState */
module.exports = async function voiceStateUpdate(updatedState) {
  if (this.client.botType == 'dev') return;

  if (this.guild.afkChannel) {
    if (updatedState.channel?.id != this.guild.afkChannel.id) void removeAfkStatus.call(updatedState);
    else if (updatedState.channel.id == this.guild.afkChannel.id) void setAfkStatus.call(updatedState);
  }

  const setting = this.guild.db.config.logger?.voiceChannelActivity;
  if (!setting?.enabled || this.channelId == updatedState.channelId) return;

  const channelToSend = this.guild.channels.cache.get(setting.channel);
  if (
    !channelToSend?.isTextBased() || this.guild.members.me.permissionsIn(channelToSend)
      .missing([Permission.ViewChannel, Permission.SendMessages]).length
  ) return;

  const
    embed = new EmbedBuilder({
      author: { name: updatedState.member.user.tag, iconURL: updatedState.member.displayAvatarURL() },
      timestamp: Date.now(),
      color: GRAY
    }),
    lang = this.client.i18n.getTranslator({
      locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPaths: ['events.logger.voiceStateUpdate']
    }),
    oldChannelField = () => (
      { name: lang('oldChannel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: false }
    ),
    updatedChannelField = () => (
      { name: lang('newChannel'), value: `${channelMention(updatedState.channel.id)} (${inlineCode(updatedState.channel.id)})`, inline: false }
    );

  if (!this.channel?.id) {
    embed.data.description = lang('embedDescriptionJoin', { executor: userMention(updatedState.member.id), newChannel: updatedState.channel.name });
    embed.data.fields = [updatedChannelField()];
  }
  else if (updatedState.channelId) {
    embed.data.description = lang('embedDescriptionMove', {
      executor: userMention(updatedState.member.id), oldChannel: this.channel.name, newChannel: updatedState.channel.name
    });
    embed.data.fields = [oldChannelField(), updatedChannelField()];
  }
  else {
    embed.data.description = lang('embedDescriptionLeave', { executor: userMention(updatedState.member.id), oldChannel: this.channel.name });
    embed.data.fields = [oldChannelField()];
  }

  return channelToSend.send({ embeds: [embed] });
};