const
  { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } = require('discord.js'),
  TWENTY_SEC = 2e4;

/**
 * @this {import('discord.js').Collection<string, Message<true> | import('discord.js').PartialMessage>}
 * @param {import('discord.js').GuildTextBasedChannel}channel*/
module.exports = async function messageDeleteBulk(channel) {
  const setting = channel.guild.db.config.logger?.messageDelete;

  if (channel.client.botType == 'dev' || !setting?.enabled) return;

  const channelToSend = channel.guild.channels.cache.get(setting.channel);
  if (!channelToSend || channelToSend.permissionsFor(channel.guild.members.me).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewAuditLog]).length)
    return;

  await sleep(1000); // Makes sure the audit log gets created before trying to fetch it

  const
    { executor, reason } = (await channel.guild.fetchAuditLogs({ limit: 6, type: AuditLogEvent.MessageBulkDelete })).entries
      .find(e => e.extra.channel.id == channel.id && e.extra.count == this.size && Date.now() - e.createdTimestamp < TWENTY_SEC) ?? {},

    /** @type {lang} */
    lang = channel.client.i18n.__.bBind(channel.client.i18n, { locale: channel.guild.db.config.lang ?? channel.guild.localeCode, backupPath: 'events.logger.messageDeleteBulk' }),
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      description: lang('embedDescription', { executor: executor ? `<@${executor.id}>` : lang('events.logger.someone'), channel: channel.name, count: this.size.toString() }),
      fields: [{ name: lang('global.channel'), value: `<#${channel.id}> (\`${channel.id}\`)`, inline: false }],
      timestamp: Date.now(),
      color: 0xED498D
    });

  if (executor) embed.data.fields.push({ name: lang('events.logger.executor'), value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('events.logger.reason'), value: reason, inline: false });

  return channelToSend.send({ embeds: [embed] });
};