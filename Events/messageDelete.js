const
  { MessageFlags, EmbedBuilder, PermissionFlagsBits, AuditLogEvent, Colors, ALLOWED_SIZES } = require('discord.js'),
  { constants: { embedFieldValueMaxLength, suffix }, timeFormatter: { msInSecond } } = require('#Utils'),
  PURPLE = 0x822AED,
  AUDITLOG_FETCHLIMIT = 6,
  TWENTY_SEC = 2e4;


/**
 * @this {Message<true> | PartialMessage<true>}
 * @param {lang}lang
 * @param {string | Record<string, string>} descriptionData*/
async function sendeMinigameDeletedEmbed(lang, descriptionData) {
  const embed = new EmbedBuilder({
    author: { name: this.user?.username, iconURL: this.member?.displayAvatarURL() },
    title: lang('embedTitle'),
    description: lang('embedDescription', descriptionData),
    color: Colors.Red,
    timestamp: this.createdTimestamp
  });

  return this.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
}

/**
 * @this {Message<true> | PartialMessage<true>}
 * @param {lang}lang*/
function countingHandler(lang) {
  const { lastNumber } = this.guild.db.channelMinigames?.counting?.[this.channel.id] ?? {};
  if (lastNumber == undefined || lastNumber - this.originalContent || Number.isNaN(Number.parseInt(this.originalContent))) return;

  lang.__boundArgs__[0].backupPath = 'commands.minigames.counting.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, { deletedNum: this.originalContent, nextNum: lastNumber + 1 });
}

/**
 * @this {Message<true> | PartialMessage<true>}
 * @param {lang}lang*/
function wordchainHandler(lang) {
  const { lastWordChar } = this.guild.db.channelMinigames?.wordchain?.[this.channel.id] ?? {};
  if (!lastWordChar || !this.originalContent || !/^\p{L}+$/u.test(this.originalContent)) return;

  lang.__boundArgs__[0].backupPath = 'commands.minigames.wordchain.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, this.originalContent);
}

/** @this {Message | PartialMessage}*/
module.exports = async function messageDelete() {
  if (this.client.botType == 'dev' || !this.inGuild() || this.flags.has(MessageFlags.Ephemeral) || this.flags.has(MessageFlags.Loading)) return;

  /** @type {lang}*/
  const lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPath: 'commands.minigames.counting.userDeletedMsg' });

  countingHandler.call(this, lang);
  wordchainHandler.call(this, lang);

  const setting = this.guild.db.config.logger?.messageDelete;
  if (!setting?.enabled) return;

  const channelToSend = this.guild.channels.cache.get(setting.channel);
  if (!channelToSend || this.guild.members.me.permissionsIn(channelToSend).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewAuditLog]).length)
    return;

  await sleep(msInSecond); // Make sure the audit log gets created before trying to fetch it

  lang.__boundArgs__[0].backupPath = 'events.logger';

  const
    { executor, reason } = (await this.guild.fetchAuditLogs({ limit: AUDITLOG_FETCHLIMIT, type: AuditLogEvent.MessageDelete })).entries
      .find(e => (!this.user || e.target.id == this.user.id) && e.extra.channel.id == this.channel.id && Date.now() - e.createdTimestamp < TWENTY_SEC) ?? {},
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      thumbnail: this.member ? { url: this.member.displayAvatarURL({ size: ALLOWED_SIZES[3] }) } : undefined, /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 3rd valid resolution */
      description: lang('messageDelete.embedDescription', { executor: executor ? `<@${executor.id}>` : lang('someone'), channel: this.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: true },
        { name: lang('messageDelete.content'), value: '', inline: false }
      ],
      timestamp: Date.now(),
      color: PURPLE
    });

  const field = embed.data.fields.at(-1);
  if (this.originalContent) field.value += `${this.originalContent}\n`;
  if (this.attachments.size) field.value += this.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';
  if (this.embeds.length) field.value += lang('embeds', this.embeds.length) + '\n';
  if (this.components.length) field.value += lang('messageDelete.components', this.components.length);

  if (!field.value) field.value += lang('unknownContent');
  else if (field.value.length > embedFieldValueMaxLength) field.value = field.value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  // We don't get the user if the message is not cached
  if (this.user) embed.data.fields.push({ name: lang('messageDelete.author'), value: `${this.user.tag} (\`${this.user.id}\`)`, inline: true });
  if (executor) embed.data.fields.push({ name: lang('executor'), value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('reason'), value: reason, inline: false });

  return channelToSend.send({ embeds: [embed] });
};