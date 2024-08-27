const { AllowedMentionsTypes, PermissionFlagsBits, VoiceState } = require('discord.js');

/**
 * @type {import('.')['afk']['getAfkStatus']}
 * @this {ThisParameterType<import('.')['afk']['getAfkStatus']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
module.exports.getAfkStatus = async function getAfkStatus(target, lang) {
  const { message, createdAt } = this.guild?.db.afkMessages?.[target.id] ?? ('user' in target ? target.user : target).db.afkMessage ?? {};
  if (!message) return this.customReply(lang('getNoneFound'));

  return this.customReply(lang('events.message.afkMsg', {
    member: target.displayName.replace(/^\[AFK] /, ''), message, timestamp: Math.round(createdAt / 1000)
  }));
};

/**
 * @type {import('.')['afk']['listAfkStatuses']}
 * @this {ThisParameterType<import('.')['afk']['listAfkStatuses']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
module.exports.listAfkStatuses = async function listAfkStatuses(lang) {
  const afkMessages = this.guild.members.cache.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
    if (message) {
      acc.push('- ' + lang('events.message.afkMsg', {
        member: e.nickname?.startsWith('[AFK] ') ? e.nickname.slice(6) : e.displayName,
        message, timestamp: Math.round(createdAt / 1000)
      }));
    }

    return acc;
  }, []).join('\n');

  return this.customReply(afkMessages || lang('getNoneFound'));
};

/**
 * @type {import('.')['afk']['setAfkStatus']}
 * @this {ThisParameterType<import('.')['afk']['setAfkStatus']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
module.exports.setAfkStatus = async function setAfkStatus(lang, global, message) {
  const user = this.member?.user;
  await (global || !this.guild
    ? user.updateDB('afkMessage', { message, createdAt: this.createdAt })
    : this.guild.updateDB(`afkMessages.${user.id}`, { message, createdAt: this.createdAt }));

  if (this.member) void toggleAfkPrefix(this.member);

  if (this instanceof VoiceState) return;
  return this.customReply({ content: lang(global || !this.guild ? 'globalSuccess' : 'success', message), allowedMentions: { parse: [AllowedMentionsTypes.User] } });
};

/**
 * @type {import('.')['afk']['removeAfkStatus']}
 * @this {ThisParameterType<import('.')['afk']['removeAfkStatus']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
module.exports.removeAfkStatus = async function removeAfkStatus() {
  if (!this.member || !this.channel || !this.guild) return; // `!this.channel || !this.guild` as typeguard

  const { createdAt, message } = this.guild.db.afkMessages?.[this.member.id] ?? this.member.user.db.afkMessage ?? {}; // `member.user` for VoiceState support
  if (!message) return;

  void toggleAfkPrefix(this.member);

  await this.client.db.delete('userSettings', `${this.member.id}.afkMessage`);
  await this.client.db.delete('guildSettings', `${this.guild.id}.afkMessages.${this.member.id}`);

  const msg = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkEnd', { timestamp: Math.round(createdAt.getTime() / 1000), message });
  if ('customReply' in this) return this.customReply(msg);
  if (this.channel.permissionsFor(this.member.id).has(PermissionFlagsBits.SendMessages) && this.channel.permissionsFor(this.client.user.id).has(PermissionFlagsBits.SendMessages))
    return this.channel.send(`<@${this.member.id}>\n` + msg);
};

/**
 * @type {import('.')['afk']['sendAfkMessages']}
 * @this {ThisParameterType<import('.')['afk']['sendAfkMessages']>}
 * Here due to `@typescript-eslint/no-invalid-this`*/
module.exports.sendAfkMessages = async function sendAfkMessages() {
  const afkMsgs = this.mentions.members.reduce((acc, e) => {
    const { message, createdAt } = this.guild.db.afkMessages?.[e.user.id] ?? e.user.db.afkMessage ?? {};
    if (!message || e.id == this.user.id) return acc;

    const afkMessage = this.client.i18n.__({ locale: this.guild.localeCode }, 'events.message.afkMsg', {
      member: e.nickname?.startsWith('[AFK] ') ? e.nickname.slice(6) : e.displayName,
      message, timestamp: Math.round(createdAt / 1000)
    });

    if (acc.length + afkMessage.length >= 2000) {
      void this.customReply(acc);
      acc = '';
    }

    return `${acc}${afkMessage}\n`;
  }, '');

  if (afkMsgs.length) return this.customReply({ content: afkMsgs, allowedMentions: { parse: [AllowedMentionsTypes.User] } });
};

/** @type {import('.')['afk']['toggleAfkPrefix']}*/
async function toggleAfkPrefix(member, prefix = '[AFK] ') {
  if (!member.moderatable) return;

  if (member.nickname?.startsWith(prefix)) {
    await member.setNickname(member.nickname.slice(prefix.length));
    return false;
  }

  if (member.displayName.length < 32 - prefix.length) {
    await member.setNickname(`${prefix}${member.displayName}`);
    return true;
  }
}
module.exports.toggleAfkPrefix = toggleAfkPrefix;
