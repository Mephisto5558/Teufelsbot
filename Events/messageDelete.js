const { EmbedBuilder, PermissionFlagsBits, AuditLogEvent, Colors } = require('discord.js');

/**@this Message*/
function countingHandler(lang) {
  const lastNum = this.guild.db?.counting?.[this.channel.id]?.lastNumber || NaN;
  if (isNaN(this.originalContent || NaN) || isNaN(lastNum) || lastNum - this.originalContent) return;

  const embed = new EmbedBuilder({
    author: { name: this.user?.username ?? lang('unknown'), iconURL: this.member?.displayAvatarURL() },
    title: lang('embedTitle'),
    description: lang('embedDescription', { deletedNum: this.originalContent, nextNum: lastNum + 1 }),
    color: Colors.Red,
    timestamp: this.createdTimestamp
  });

  return this.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
}

/**@this Message*/
module.exports = async function messageDelete() {
  if (this.client.botType == 'dev' || !this.guild) return;

  countingHandler.call(this, this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config?.lang ?? this.guild.localeCode, backupPath: 'commands.minigames.counting.userDeletedMsg' }));

  const setting = this.guild?.db.config?.logger?.messageDelete ?? {};
  if (!setting.enabled || !setting.channel) return;

  const channel = this.guild.channels.cache.get(setting.channel);
  if (!channel || this.guild.members.me.permissionsIn(channel).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length) return;

  await sleep(1000); //Make sure the audit log gets created before trying to fetching it

  const
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config?.lang ?? this.guild.localeCode, backupPath: 'events.logger' }),
    { executor, reason } = (await this.guild.fetchAuditLogs({ limit: 6, type: AuditLogEvent.MessageDelete })).entries.find(e => (!this.user?.id || e.target.id == this.user.id) && e.extra.channel.id == this.channel.id && Date.now() - e.createdTimestamp < 20000) ?? {},
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : null,
      thumbnail: this.member ? { url: this.member.displayAvatarURL({ size: 128 }) } : null,
      description: lang('messageDelete.embedDescription', { executor: executor ? `<@${executor.id}>` : lang('someone'), channel: this.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false },
        { name: lang('messageDelete.content'), value: '', inline: false }
      ],
      timestamp: Date.now(),
      color: 8530669,
    });

  if (this.originalContent) embed.data.fields[1].value += `${this.originalContent}\n`;
  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';
  if (this.embeds.length) embed.data.fields[1].value += lang('embeds', this.embeds.length) + '\n';
  if (this.components.length) embed.data.fields[1].value += lang('messageDelete.components', this.components.length);
  
  if (!embed.data.fields[1].value) embed.data.fields[1].value += lang('unknownContent');
  else if (embed.data.fields[1].value.length > 1024) embed.data.fields[1].value = embed.data.fields[1].value.slice(0, 1021) + '...';

  //We don't get the user/member if the message is not cached
  if (this.user) embed.data.fields.push({ name: lang('messageDelete.author'), value: `${this.user.tag} (\`${this.user.id}\`)`, inline: false });
  if (executor) embed.data.fields.push({ name: lang('executor'), value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('reason'), value: reason, inline: false });

  return channel.send({ embeds: [embed] });
};