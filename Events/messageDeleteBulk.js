/** @import { ClientEvents, GuildTextBasedChannel } from 'discord.js' */

const
  { AuditLogEvent, EmbedBuilder, MessageFlags, PermissionFlagsBits, channelMention, inlineCode, userMention } = require('discord.js'),
  { toMs: { secToMs }, sleep } = require('#Utils'),
  RED = 0xED498D,
  AUDITLOG_FETCHLIMIT = 6;

/**
 * @this {ClientEvents['messageDeleteBulk'][0]}
 * @param {ClientEvents['messageDeleteBulk'][1]} channel */
module.exports = async function messageDeleteBulk(channel) { // TODO: maybe move all the log events to `guildAuditLogEntryCreate`
  const setting = channel.guild.db.config.logger?.messageDelete;

  if (
    channel.client.botType == 'dev' || !setting?.enabled
    || !this.some(e => !e.flags.has(MessageFlags.Ephemeral) && !e.flags.has(MessageFlags.Loading))
  ) return;

  /** @type {GuildTextBasedChannel | undefined} */
  const logChannel = channel.guild.channels.cache.get(setting.channel);
  if (
    !logChannel || logChannel.permissionsFor(channel.guild.members.me)
      .missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewAuditLog]).length
  ) return;

  await sleep(secToMs(1)); // makes sure the audit log gets created before trying to fetch it

  const
    { executor, reason } = (await channel.guild.fetchAuditLogs({ limit: AUDITLOG_FETCHLIMIT, type: AuditLogEvent.MessageBulkDelete })).entries
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers */
      .find(e => e.target.id == channel.id && e.extra.count == this.size && Date.now() - e.createdTimestamp < secToMs(20)) ?? {},
    lang = channel.client.i18n.getTranslator({
      locale: channel.guild.db.config.lang ?? channel.guild.localeCode, backupPaths: ['events.logger.messageDeleteBulk']
    }),
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      description: lang('embedDescription', {
        executor: executor ? userMention(executor.id) : lang('events.logger.someone'),
        channel: channel.name, count: this.size.toString()
      }),
      fields: [{ name: lang('global.channel'), value: `${channelMention(channel.id)} (${inlineCode(channel.id)})`, inline: false }],
      timestamp: Date.now(),
      color: RED
    });

  if (executor)
    embed.data.fields.push({ name: lang('events.logger.executor'), value: `${executor.tag} (${inlineCode(executor.id)})`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('events.logger.reason'), value: reason, inline: false });

  return logChannel.send({ embeds: [embed] });
};