/** @import { afk } from '.' */

const
  { PermissionFlagsBits, TimestampStyles, VoiceState, inlineCode, userMention } = require('discord.js'),
  { memberNameMaxLength, messageMaxLength } = require('./constants'),
  { timeFormatter, timestamp } = require('./timeFormatter'),

  nicknamePrefix = '[AFK] ',
  nicknameRegex = /^[AFK] /;


module.exports.nicknamePrefix = nicknamePrefix;
module.exports.nicknameRegex = nicknameRegex;

/** @type {afk['getAfkStatus']} */
module.exports.getAfkStatus = async function getAfkStatus(target, lang) {
  const { message, createdAt } = this.guild?.db.afkMessages?.[target.id] ?? ('user' in target ? target.user : target).db.afkMessage ?? {};
  if (!message) return this.customReply(lang('getNoneFound'));

  return this.customReply(lang('events.message.afkMsg', {
    message, member: inlineCode(target.displayName.replace(nicknameRegex, '')), timestamp: timestamp(createdAt, TimestampStyles.RelativeTime)
  }));
};

/** @type {afk['listAfkStatuses']} */
module.exports.listAfkStatuses = async function listAfkStatuses(lang) {
  const afkMessages = this.guild.members.cache.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
    if (message) {
      acc.push('- ' + lang('events.message.afkMsg', {
        message, member: e.nickname?.startsWith(nicknamePrefix) ? e.nickname.slice(nicknamePrefix.length) : e.displayName,
        timestamp: timestamp(createdAt, TimestampStyles.RelativeTime)
      }));
    }

    return acc;
  }, []).join('\n');

  return this.customReply(afkMessages || lang('getNoneFound'));
};

/**
 * @type {afk['setAfkStatus']}
 * @description `@this` is here due to TS not understanding typeguards with generics
 * @this {ThisParameterType<afk['setAfkStatus']>} */
module.exports.setAfkStatus = async function setAfkStatus(lang, global, message) {
  const
    user = this.member?.user,
    createdAt = 'createdAt' in this ? this.createdAt : new Date();
  message ||= 'AFK'; /* eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- message can be an empty string */

  await (global || !this.guild
    ? user.updateDB('afkMessage', { message, createdAt })
    : this.guild.updateDB(`afkMessages.${user.id}`, { message, createdAt }));

  if (this.member) void setAfkPrefix(this.member);

  if (this instanceof VoiceState) return;
  return this.customReply({ content: lang(global || !this.guild ? 'globalSuccess' : 'success', message), allowedMentions: { repliedUser: true } });
};

/** @type {afk['removeAfkStatus']} */
module.exports.removeAfkStatus = async function removeAfkStatus() {
  if (!this.member || !this.guild) return; // `!this.guild` as typeguard

  // `member.user` for VoiceState support
  const { createdAt, message } = this.guild.db.afkMessages?.[this.member.id] ?? this.member.user.db.afkMessage ?? {};
  if (!message) return;

  void unsetAfkPrefix(this.member);

  await this.member.user.deleteDB('afkMessage');
  await this.guild.deleteDB(`afkMessages.${this.member.id}`);

  const
    lang = this.client.i18n.getTranslator({ locale: this.guild.localeCode }),
    msg = lang('events.message.afkEnd', { timestamp: timestamp(createdAt), formattedTime: timeFormatter(createdAt, lang).formatted, message });

  if ('customReply' in this) return this.customReply(msg);
  if (
    this.channel?.permissionsFor(this.member.id).has(PermissionFlagsBits.SendMessages)
    && this.channel.permissionsFor(this.client.user.id).has(PermissionFlagsBits.SendMessages)
  ) return this.channel.send(`${userMention(this.member.id)}\n${msg}`);
};

/** @type {afk['sendAfkMessages']} */
module.exports.sendAfkMessages = async function sendAfkMessages() {
  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
    if (!message || e.id == this.user.id) return acc;

    const afkMessage = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkMsg', {
      message, member: e.nickname?.startsWith(nicknamePrefix) ? e.nickname.slice(nicknamePrefix.length) : e.displayName,
      timestamp: timestamp(createdAt, TimestampStyles.RelativeTime)
    });

    if (acc.length + afkMessage.length >= messageMaxLength) {
      void this.customReply(acc);
      acc = '';
    }

    return `${acc}${afkMessage}\n`;
  }, '');

  if (afkMsgs.length) return this.customReply({ content: afkMsgs });
};

/** @type {afk['setAfkPrefix']} */
async function setAfkPrefix(member, prefix = nicknamePrefix) {
  if (!member.moderatable || member.displayName.length >= memberNameMaxLength - prefix.length || member.nickname?.startsWith(prefix)) return;

  await member.setNickname(`${prefix}${member.displayName}`);
  return true;
}

/** @type {afk['unsetAfkPrefix']} */
async function unsetAfkPrefix(member, prefix = nicknamePrefix) {
  if (!member.moderatable || !member.nickname?.startsWith(prefix)) return;

  await member.setNickname(member.nickname.slice(prefix.length));
  return false;
}
module.exports.setAfkPrefix = setAfkPrefix;
module.exports.unsetAfkPrefix = unsetAfkPrefix;