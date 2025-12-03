/** @import { ClientEvents, GuildTextBasedChannel } from 'discord.js' */

const
  {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags,
    PermissionFlagsBits, channelMention, hyperlink, inlineCode, userMention
  } = require('discord.js'),
  { embedFieldValueMaxLength, suffix } = require('#Utils').constants,
  PINK = 0xE62AED;

/**
 * @this {ClientEvents['messageUpdate'][0]}
 * @param {ClientEvents['messageUpdate'][1]} newMsg */
function shouldRun(newMsg) {
  const setting = this.guild?.db.config.logger?.messageUpdate;
  if (
    this.client.botType == 'dev' || !this.inGuild() || !setting?.enabled
    || !this.guild.channels.cache.has(setting.channel)
    || this.flags.has(MessageFlags.Ephemeral) || this.flags.has(MessageFlags.Loading)
  ) return;

  if (
    this.originalContent === newMsg.originalContent && this.attachments.size === newMsg.attachments.size
    && this.embeds.length === newMsg.embeds.length
  ) return;

  if (this.guild.members.me.permissionsIn(setting.channel).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length)
    return;

  return true;
}

/**
 * @this {ClientEvents['messageUpdate'][0]}
 * @param {ClientEvents['messageUpdate'][1]} newMsg */
module.exports = async function messageUpdate(newMsg) {
  if (!shouldRun.call(this, newMsg)) return;

  const

    /** @type {GuildTextBasedChannel} cannot be undefined due to `shouldRun()` */
    logChannel = this.guild.channels.cache.get(this.guild?.db.config.logger?.messageUpdate.channel),
    lang = this.client.i18n.getTranslator({
      locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPaths: ['events.logger.messageUpdate']
    }),
    embed = new EmbedBuilder({
      author: { name: newMsg.user.tag, iconURL: newMsg.user.displayAvatarURL() },
      description: lang('embedDescription', {
        executor: userMention(newMsg.user.id),
        channel: 'name' in newMsg.channel ? newMsg.channel.name : newMsg.channelId
      }),
      fields: [
        { name: lang('global.channel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: false },
        { name: lang('oldContent'), value: '', inline: false },
        { name: lang('newContent'), value: '', inline: false },
        { name: lang('author'), value: `${newMsg.user.tag} (${inlineCode(newMsg.user.id)})`, inline: false }
      ],
      timestamp: Date.now(),
      color: PINK
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('messageLink'),
        url: newMsg.url,
        style: ButtonStyle.Link
      })]
    });

  if (this.originalContent) embed.data.fields[1].value += `${this.originalContent}\n`;
  if (newMsg.originalContent) embed.data.fields[2].value += `${newMsg.originalContent}\n`;

  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';
  if (newMsg.attachments.size) embed.data.fields[2].value += newMsg.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';

  if (this.embeds.length) embed.data.fields[1].value += lang('events.logger.embeds', this.embeds.length);
  if (newMsg.embeds.length) embed.data.fields[2].value += lang('events.logger.embeds', newMsg.embeds.length);

  if (embed.data.fields[1].value == '') embed.data.fields[1].value = lang('global.unknown');
  if (embed.data.fields[2].value == '') embed.data.fields[2].value = lang('global.unknown');

  if (embed.data.fields[1].value.length > embedFieldValueMaxLength)
    embed.data.fields[1].value = embed.data.fields[1].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;
  if (embed.data.fields[2].value.length > embedFieldValueMaxLength)
    embed.data.fields[2].value = embed.data.fields[2].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  return logChannel.send({ embeds: [embed], components: [component] });
};