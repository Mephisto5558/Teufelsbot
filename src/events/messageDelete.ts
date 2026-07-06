import {
  ALLOWED_SIZES, AuditLogEvent, Colors, EmbedBuilder, MessageFlags, bold, channelMention, hyperlink, inlineCode, userMention
} from 'discord.js';
import { Permission } from '@mephisto5558/command';
import { embedFieldValueMaxLength, suffix } from '#utils/constants.ts';
import { msInSecond } from '#utils/timeFormatter.ts';
import { sleep } from '#utils';

import type { DiscordEvent } from './index.ts';

const
  PURPLE = 0x822AED,
  AUDITLOG_FETCHLIMIT = 6,
  TWENTY_SEC = 2e4;


async function sendeMinigameDeletedEmbed(
  this: ThisParameterType<DiscordEvent<'messageDelete'>>, lang: lang, descriptionData: string | Record<string, string>
) {
  const embed = new EmbedBuilder({
    author: { name: this.user.username, iconURL: this.member?.displayAvatarURL() },
    title: lang('embedTitle'),
    description: lang('embedDescription', descriptionData),
    color: Colors.Red,
    timestamp: this.createdTimestamp
  });

  return this.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
}

async function countingHandler(this: ThisParameterType<DiscordEvent<'messageDelete'>>, lang: lang) {
  const { lastNumber } = this.guild.db.channelMinigames?.counting?.[this.channel.id] ?? {};
  if (lastNumber == undefined || lastNumber - this.originalContent || Number.isNaN(Number.parseInt(this.originalContent, 10))) return;

  lang.config.backupPaths[0] = 'commands.minigames.counting.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, { deletedNum: bold(this.originalContent), nextNum: bold(lastNumber + 1) });
}

async function wordchainHandler(this: ThisParameterType<DiscordEvent<'messageDelete'>>, lang: lang) {
  const { lastWordChar } = this.guild.db.channelMinigames?.wordchain?.[this.channel.id] ?? {};
  if (!lastWordChar || !this.originalContent || !/^\p{L}+$/u.test(this.originalContent)) return;

  lang.config.backupPaths[0] = 'commands.minigames.wordchain.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, bold(this.originalContent));
}

function shouldRun(this: ThisParameterType<DiscordEvent<'messageDelete'>>) {
  const setting = this.guild?.db.config.logger?.messageDelete;
  if (
    !setting?.enabled || !this.guild.channels.cache.has(setting.channel)
    || this.guild.members.me.permissionsIn(setting.channel)
      .missing([Permission.ViewChannel, Permission.SendMessages, Permission.ViewAuditLog]).length
  ) return;

  return true;
}

export default (async function messageDelete(): Promise<unknown> {
  if (this.client.botType == 'dev' || !this.guild || this.flags.has(MessageFlags.Ephemeral) || this.flags.has(MessageFlags.Loading)) return;

  const lang = this.client.i18n.getTranslator({
    locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPaths: ['commands.minigames.counting.userDeletedMsg']
  });

  void countingHandler.call(this, lang);
  void wordchainHandler.call(this, lang);

  if (!shouldRun.call(this)) return;

  lang.config.backupPaths[0] = 'events.logger';

  await sleep(msInSecond); // makes sure the audit log gets created before trying to fetch it

  const

    /** @type {GuildTextBasedChannel} cannot be undefined due to `shouldRun()` */
    logChannel = this.guild.channels.cache.get(this.guild.db.config.logger.messageDelete.channel),
    { executor, reason } = (await this.guild.fetchAuditLogs({ limit: AUDITLOG_FETCHLIMIT, type: AuditLogEvent.MessageDelete })).entries
      .find(e => (e.target.id == this.user.id) && e.extra.channel.id == this.channel.id && Date.now() - e.createdTimestamp < TWENTY_SEC) ?? {},
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3rd valid resolution */
      thumbnail: this.member ? { url: this.member.displayAvatarURL({ size: ALLOWED_SIZES[3] }) } : undefined,
      description: lang('messageDelete.embedDescription', {
        executor: executor ? userMention(executor.id) : lang('someone'), channel: 'name' in this.channel ? this.channel.name : this.channelId
      }),
      fields: [
        { name: lang('global.channel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: true },
        { name: lang('messageDelete.content'), value: '', inline: false },
        { name: lang('messageDelete.author'), value: `${this.user.tag} (${inlineCode(this.user.id)})`, inline: true }
      ],
      timestamp: Date.now(),
      color: PURPLE
    }),
    contentField = embed.data.fields[1];

  if (this.originalContent) contentField.value += `${this.originalContent}\n`;
  if (this.attachments.size) contentField.value += this.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';
  if (this.embeds.length) contentField.value += lang('embeds', this.embeds.length) + '\n';
  if (this.components.length) contentField.value += lang('messageDelete.components', this.components.length);

  if (!contentField.value) contentField.value += lang('unknownContent');
  else if (contentField.value.length > embedFieldValueMaxLength)
    contentField.value = contentField.value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  if (executor) embed.data.fields.push({ name: lang('executor'), value: `${executor.tag} (${inlineCode(executor.id)})`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('reason'), value: reason, inline: false });

  return logChannel.send({ embeds: [embed] });
}) as DiscordEvent<'messageDelete'>;