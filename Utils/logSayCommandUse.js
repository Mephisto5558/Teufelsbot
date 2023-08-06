const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**@this {import('discord.js').Message}, @param {import('discord.js').GuildMember}member*/
module.exports = function logSayCommandUse(member, lang) {
  const setting = this.guild?.db.config?.logger?.sayCommandUsed ?? {};
  if (this.client.botType == 'dev' || !setting.enabled || !setting.channel) return;

  const channel = this.guild.channels.cache.get(setting.channel);
  if (!channel && this.guild.members.me.permissionsIn(channel).missing([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]).length) return;

  lang.__boundArgs__[0].backupPath = 'events.logger.sayCommandUsed';

  const
    embed = new EmbedBuilder({
      author: { name: member.user.username, iconURL: member.displayAvatarURL() },
      description: lang('embedDescription', { executor: `<@${member.id}>`, channel: this.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `<#${this.channel.id}> (\`${this.channel.id}\`)`, inline: false },
        { name: lang('content'), value: this.content ?? (this.embeds.length ? lang('events.logger.embeds', this.embeds.length) : lang('events.logger.unknown')), inline: false },
        { name: lang('author'), value: `${member.user.username} (\`${member.id}\`)`, inline: false }
      ],
      timestamp: Date.now(),
      color: 3553599,
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('messageLink'),
        url: this.url,
        style: ButtonStyle.Link
      })]
    });

  return channel.send({ embeds: [embed], components: [component] });
};