const
  { EmbedBuilder, PermissionFlagsBits, AuditLogEvent } = require('discord.js'),
  { I18nProvider } = require('../Utils');

/**@this {import('discord.js').Message}*/
function countingHandler() {
  const { counting: { [this.channel.id]: countingData } = {} } = this.guild.db;
  if (countingData?.lastNumber && Number(this.originalContent))
    return this.channel.send({ content: `<t:${Math.round(this.createdTimestamp / 1000)}>\n<@${this.user.id}>: *${countingData.lastNumber} -> ${this.originalContent}*`, allowedMentions: { parse: [] } });
}

/**@this {import('discord.js').Message}*/
module.exports = async function messageDelete() {
  if (this.client.botType == 'dev' || !this.guild) return;

  countingHandler.call(this);

  const setting = this.guild?.db.config?.logger?.messageDelete ?? {};
  if (!setting.enabled || !setting.channel) return;

  const channel = this.guild.channels.cache.get(setting.channel);
  if (!channel || this.guild.members.me.permissionsIn(channel).missing([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]).length) return;

  await sleep(1000); //Make sure the audit log gets created before trying to fetching it

  const
    lang = I18nProvider.__.bBind(I18nProvider, { locale: this.guild.db.config?.lang ?? this.guild.localeCode, backupPath: 'events.logger.messageDelete' }),
    { executor, reason } = (await this.guild.fetchAuditLogs({ limit: 6, type: AuditLogEvent.MessageDelete })).entries.find(e => (!this.user?.id || e.target.id == this.user.id) && e.extra.channel.id == this.channel.id && Date.now() - e.createdTimestamp < 20000) ?? {},
    embed = new EmbedBuilder({
      author: executor ? { name: executor.displayName, iconURL: executor.displayAvatarURL() } : null,
      thumbnail: this.member ? { url: this.member.displayAvatarURL({ size: 128 }) } : null,
      description: lang('embedDescription', { executor: executor ? `<@${executor.id}>` : lang('events.logger.someone'), channel: this.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false },
        { name: lang('content'), value: '', inline: false }
      ],
      timestamp: Date.now(),
      color: 8530669,
    });

  if (this.originalContent) embed.data.fields[1].value += `${this.originalContent}\n`;
  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';
  if (this.embeds.length) embed.data.fields[1].value += lang('events.logger.embeds', this.embeds.length) + '\n';
  if (this.components.length) embed.data.fields[1].value += lang('components', this.components.length);

  //We don't get the user/member if the message is not cached
  if (this.user) embed.data.fields.push({ name: lang('author'), value: `${this.user.displayName} (\`${this.user.id}\`)`, inline: false });
  if (executor) embed.data.fields.push({ name: lang('events.logger.executor'), value: `${executor.displayName} (\`${executor.id}\`)`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('events.logger.reason'), value: reason, inline: false });

  return channel.send({ embeds: [embed] });
};