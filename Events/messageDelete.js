/** @import { OmitPartialGroupDMChannel, ClientEvents, GuildTextBasedChannel } from 'discord.js' */

const
  {
    ALLOWED_SIZES, AuditLogEvent, Colors, EmbedBuilder, MessageFlags,
    PermissionFlagsBits, bold, channelMention, hyperlink, inlineCode, userMention
  } = require('discord.js'),
  { constants: { embedFieldValueMaxLength, suffix }, timeFormatter: { msInSecond } } = require('#Utils'),
  PURPLE = 0x822AED,
  AUDITLOG_FETCHLIMIT = 6,
  TWENTY_SEC = 2e4;


/**
 * @this {OmitPartialGroupDMChannel<Message<true> | PartialMessage<true>>}
 * @param {lang} lang
 * @param {string | Record<string, string>} descriptionData */
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
 * @this {OmitPartialGroupDMChannel<Message<true> | PartialMessage<true>>}
 * @param {lang} lang */
async function countingHandler(lang) {
  const { lastNumber } = this.guild.db.channelMinigames?.counting?.[this.channel.id] ?? {};
  if (lastNumber == undefined || lastNumber - this.originalContent || Number.isNaN(Number.parseInt(this.originalContent))) return;

  lang.config.backupPaths[0] = 'commands.minigames.counting.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, { deletedNum: bold(this.originalContent), nextNum: bold(lastNumber + 1) });
}

/**
 * @this {OmitPartialGroupDMChannel<Message<true> | PartialMessage<true>>}
 * @param {lang} lang */
async function wordchainHandler(lang) {
  const { lastWordChar } = this.guild.db.channelMinigames?.wordchain?.[this.channel.id] ?? {};
  if (!lastWordChar || !this.originalContent || !/^\p{L}+$/u.test(this.originalContent)) return;

  lang.config.backupPaths[0] = 'commands.minigames.wordchain.userDeletedMsg';
  return sendeMinigameDeletedEmbed.call(this, lang, bold(this.originalContent));
}

/** @this {ClientEvents['messageDelete'][0]} */
function shouldRun() {
  const setting = this.guild?.db.config.logger?.messageDelete;
  if (
    !setting?.enabled || !this.guild.channels.cache.has(setting.channel)
    || this.guild.members.me.permissionsIn(setting.channel)
      .missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewAuditLog]).length
  ) return;

  return true;
}

/** @this {ClientEvents['messageDelete'][0]} */
module.exports = async function messageDelete() {
  if (this.client.botType == 'dev' || !this.inGuild() || this.flags.has(MessageFlags.Ephemeral) || this.flags.has(MessageFlags.Loading)) return;

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
      .find(e => (e.target.id == this.user?.id) && e.extra.channel.id == this.channel.id && Date.now() - e.createdTimestamp < TWENTY_SEC) ?? {},
    embed = new EmbedBuilder({
      author: executor ? { name: executor.tag, iconURL: executor.displayAvatarURL() } : undefined,
      /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3rd valid resolution */
      thumbnail: this.member ? { url: this.member.displayAvatarURL({ size: ALLOWED_SIZES[3] }) } : undefined,
      description: lang('messageDelete.embedDescription', {
        executor: executor ? userMention(executor.id) : lang('someone'), channel: 'name' in this.channel ? this.channel.name : this.channelId
      }),
      fields: [
        { name: lang('global.channel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: true },
        { name: lang('messageDelete.content'), value: '', inline: false }
      ],
      timestamp: Date.now(),
      color: PURPLE
    }),
    field = embed.data.fields.at(-1);

  if (this.originalContent) field.value += `${this.originalContent}\n`;
  if (this.attachments.size) field.value += this.attachments.map(e => hyperlink(e.url, e.name)).join(', ') + '\n';
  if (this.embeds.length) field.value += lang('embeds', this.embeds.length) + '\n';
  if (this.components.length) field.value += lang('messageDelete.components', this.components.length);

  if (!field.value) field.value += lang('unknownContent');
  else if (field.value.length > embedFieldValueMaxLength) field.value = field.value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  // we don't get the user if the message is not cached
  if (this.user)
    embed.data.fields.push({ name: lang('messageDelete.author'), value: `${this.user.tag} (${inlineCode(this.user.id)})`, inline: true });
  if (executor) embed.data.fields.push({ name: lang('executor'), value: `${executor.tag} (${inlineCode(executor.id)})`, inline: false });
  if (reason) embed.data.fields.push({ name: lang('reason'), value: reason, inline: false });

  return logChannel.send({ embeds: [embed] });
};