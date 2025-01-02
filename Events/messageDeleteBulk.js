const
  { MessageFlags, EmbedBuilder, PermissionFlagsBits, AuditLogEvent, userMention, channelMention, inlineCode } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter,
  RED = 0xED498D,
  AUDITLOG_FETCHLIMIT = 6;

/**
 * @this {import('discord.js').ClientEvents['messageDeleteBulk'][0]}
 * @param {import('discord.js').ClientEvents['messageDeleteBulk'][1]}channel */
module.exports = async function messageDeleteBulk(channel) {
  const setting = channel.guild.db.config.logger?.messageDelete;

  if (channel.client.botType == 'dev' || !setting?.enabled || !this.some(e => !e.flags.has(MessageFlags.Ephemeral) && !e.flags.has(MessageFlags.Loading))) return;

  const channelToSend = channel.guild.channels.cache.get(setting.channel);
  if (!channelToSend || channelToSend.permissionsFor(channel.guild.members.me).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewAuditLog]).length)
    return;

  await sleep(msInSecond); // Makes sure the audit log gets created before trying to fetch it

  const
    { executor, reason } = (await channel.guild.fetchAuditLogs({ limit: AUDITLOG_FETCHLIMIT, type: AuditLogEvent.MessageBulkDelete })).entries
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 20s */
      .find(e => e.extra.channel.id == channel.id && e.extra.count == this.size && Date.now() - e.createdTimestamp < msInSecond * 20) ?? {},

    /** @type {lang} */
    lang = channel.client.i18n.__.bBind(channel.client.i18n, { locale: channel.guild.db.config.lang ?? channel.guild.localeCode, backupPath: 'events.logger.messageDeleteBulk' }),
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      description: lang('embedDescription', { executor: executor ? userMention(executor.id) : lang('events.logger.someone'), channel: channel.name, count: this.size.toString() }),
      fields: [{ name: lang('global.channel'), value: `${channelMention(channel.id)} (${inlineCode(channel.id)})`, inline: false }],
      timestamp: Date.now(),
      color: RED
    });

  if (executor) embed.data.fields.push({ name: lang('events.logger.executor'), value: `${executor.tag} (${inlineCode(executor.id)})`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('events.logger.reason'), value: reason, inline: false });

  return channelToSend.send({ embeds: [embed] });
};