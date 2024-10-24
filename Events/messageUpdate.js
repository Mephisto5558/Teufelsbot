const
  { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { embedFieldValueMaxLength, suffix } = require('#Utils').constants;

/**
 * @this {import('discord.js').PartialMessage}
 * @param {import('discord.js').Message}newMsg*/
module.exports = function messageUpdate(newMsg) {
  const setting = this.guild?.db.config.logger?.messageUpdate;
  if (
    this.client.botType == 'dev' || !this.inGuild() || !setting?.enabled
    || this.originalContent === newMsg.originalContent && this.attachments.size === newMsg.attachments.size && this.embeds.length === newMsg.embeds.length
  ) return;

  const channelToSend = this.guild.channels.cache.get(setting.channel);
  if (!channelToSend || this.guild.members.me.permissionsIn(channelToSend).missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]).length) return;

  const

    /** @type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild.db.config.lang ?? this.guild.localeCode, backupPath: 'events.logger.messageUpdate' }),
    embed = new EmbedBuilder({
      author: { name: newMsg.user.tag, iconURL: newMsg.user.displayAvatarURL() },
      description: lang('embedDescription', { executor: `<@${newMsg.user.id}>`, channel: newMsg.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false },
        { name: lang('oldContent'), value: '', inline: false },
        { name: lang('newContent'), value: '', inline: false },
        { name: lang('author'), value: `${newMsg.user.tag} (\`${newMsg.user.id}\`)`, inline: false }
      ],
      timestamp: Date.now(),
      color: 0xE62AED
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('messageLink'),
        url: newMsg.url,
        style: ButtonStyle.Link
      })]
    });

  if (this.originalContent) embed.data.fields[1].value += `${this.originalContent}\n`;
  if (newMsg.originalContent) embed.data.fields[2].value += `${newMsg.originalContent}\n`;

  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';
  if (newMsg.attachments.size) embed.data.fields[2].value += newMsg.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';

  if (this.embeds.length) embed.data.fields[1].value += lang('events.logger.embeds', this.embeds.length);
  if (newMsg.embeds.length) embed.data.fields[2].value += lang('events.logger.embeds', newMsg.embeds.length);

  if (embed.data.fields[1].value == '') embed.data.fields[1].value = lang('global.unknown');
  if (embed.data.fields[2].value == '') embed.data.fields[2].value = lang('global.unknown');

  if (embed.data.fields[1].value.length > embedFieldValueMaxLength) embed.data.fields[1].value = embed.data.fields[1].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;
  if (embed.data.fields[2].value.length > embedFieldValueMaxLength) embed.data.fields[2].value = embed.data.fields[2].value.slice(0, embedFieldValueMaxLength - suffix.length) + suffix;

  return channelToSend.send({ embeds: [embed], components: [component] });
};