const
  { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { I18nProvider } = require('../Utils');

/**@this {import('discord.js').Message} old message @param {import('discord.js').Message}newMsg*/
module.exports = async function messageUpdate(newMsg) {
  const setting = this.guild?.db.config?.logger?.messageUpdate ?? {};
  if (
    /*this.client.botType == 'dev' ||*/ !this.guild || !setting.enabled || !setting.channel ||
    (this.content === newMsg.content && this.attachments.size === newMsg.attachments.size && this.embeds.length && newMsg.embeds.length)
  ) return;

  const channel = this.guild.channels.cache.get(setting.channel);
  if (!channel || this.guild.members.me.permissionsIn(channel).missing([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]).length) return;

  const
    lang = I18nProvider.__.bBind(I18nProvider, { locale: this.guild.db.config?.lang ?? this.guild.localeCode, backupPath: 'events.logger.messageUpdate' }),
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
      color: 15084269
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('messageLink'),
        url: newMsg.url,
        style: ButtonStyle.Link
      })]
    });

  if (this.content) embed.data.fields[1].value += `${this.content}\n`;
  if (newMsg.content) embed.data.fields[2].value += `${newMsg.content}\n`;

  if (this.attachments.size) embed.data.fields[1].value += this.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';
  if (newMsg.attachments.size) embed.data.fields[2].value += newMsg.attachments.map(e => `[${e.url}](${e.name})`).join(', ') + '\n';

  if (this.embeds.length) embed.data.fields[1].value += lang('events.logger.embeds', this.embeds.length);
  if (newMsg.embeds.length) embed.data.fields[2].value += lang('events.logger.embeds', newMsg.embeds.length);

  if (embed.data.fields[1].value == '') embed.data.fields[1].value = lang('unknown');
  if (embed.data.fields[2].value == '') embed.data.fields[2].value = lang('unknown');

  return channel.send({ embeds: [embed], components: [component] });
};