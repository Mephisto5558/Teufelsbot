import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, channelMention, hyperlink, inlineCode, userMention
} from 'discord.js';
import { Permission } from '@mephisto5558/command';
import { embedFieldValueMaxLength, suffix } from '#utils/constants.ts';

import type { DiscordEvent } from './index.ts';

const
  PINK = 0xE62AED,

  shouldRun: DiscordEvent<'messageUpdate'> = function shouldRun(updatedMsg): boolean {
    const setting = this.guild?.db.config.logger?.messageUpdate;
    if (
      this.client.botType == 'dev' || !this.inGuild() || !setting?.enabled
      || !this.guild.channels.cache.has(setting.channel)
      || this.flags.has(MessageFlags.Ephemeral) || this.flags.has(MessageFlags.Loading)
    ) return false;

    if (
      this.originalContent === updatedMsg.originalContent && this.attachments.size === updatedMsg.attachments.size
      && this.embeds.length === updatedMsg.embeds.length
    ) return false;

    return !this.guild.members.me.permissionsIn(setting.channel).missing([Permission.ViewChannel, Permission.SendMessages]).length;
  };

export default (async function messageUpdate(updatedMsg) {
  if (!shouldRun.call(this, updatedMsg)) return;

  const

    /** cannot be undefined due to `shouldRun()` */
    logChannel = this.guild.channels.cache.get(this.guild?.db.config.logger?.messageUpdate.channel),
    lang = this.client.i18n.getTranslator({
      locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPaths: ['events.logger.messageUpdate']
    }),
    embed = new EmbedBuilder({
      author: { name: updatedMsg.user.tag, iconURL: updatedMsg.user.displayAvatarURL() },
      description: lang('embedDescription', {
        executor: userMention(updatedMsg.user.id),
        channel: 'name' in updatedMsg.channel ? updatedMsg.channel.name : updatedMsg.channelId
      }),
      fields: [
        { name: lang('global.channel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: false },
        { name: lang('oldContent'), value: '', inline: false },
        { name: lang('newContent'), value: '', inline: false },
        { name: lang('author'), value: `${updatedMsg.user.tag} (${inlineCode(updatedMsg.user.id)})`, inline: false }
      ],
      timestamp: Date.now(),
      color: PINK
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('messageLink'),
        url: updatedMsg.url,
        style: ButtonStyle.Link
      })]
    });

  if (this.originalContent) embed.data.fields[1].value += `${this.originalContent}\n`;
  if (updatedMsg.originalContent) embed.data.fields[2].value += `${updatedMsg.originalContent}\n`;

  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';
  if (updatedMsg.attachments.size) embed.data.fields[2].value += updatedMsg.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';

  if (this.embeds.length) embed.data.fields[1].value += lang('events.logger.embeds', this.embeds.length);
  if (updatedMsg.embeds.length) embed.data.fields[2].value += lang('events.logger.embeds', updatedMsg.embeds.length);

  if (embed.data.fields[1].value == '') embed.data.fields[1].value = lang('global.unknown');
  if (embed.data.fields[2].value == '') embed.data.fields[2].value = lang('global.unknown');

  if (embed.data.fields[1].value.length > embedFieldValueMaxLength)
    embed.data.fields[1].value = embed.data.fields[1].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;
  if (embed.data.fields[2].value.length > embedFieldValueMaxLength)
    embed.data.fields[2].value = embed.data.fields[2].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  return logChannel.send({ embeds: [embed], components: [component] });
}) as DiscordEvent<'messageUpdate'>;