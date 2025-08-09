const
  {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,
    PermissionFlagsBits, TextChannel, channelMention, inlineCode, userMention
  } = require('discord.js'),
  GREY = 0x36393F;

/** @type {import('.').logSayCommandUse} */
module.exports = async function logSayCommandUse(member, lang) {
  const setting = this.guild.db.config.logger?.sayCommandUsed;
  if (this.client.botType == 'dev' || !setting?.enabled) return;

  const channel = this.guild.channels.cache.get(setting.channel);
  if (
    !(channel instanceof TextChannel) || this.guild.members.me.permissionsIn(channel)
      .missing([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]).length
  ) return;

  lang.config.backupPath[0] = 'events.logger.sayCommandUsed';

  const
    embed = new EmbedBuilder({
      author: { name: member.user.tag, iconURL: member.displayAvatarURL() },
      description: lang('embedDescription', { executor: userMention(member.id), channel: this.channel.name }),
      fields: [
        { name: lang('global.channel'), value: `${channelMention(this.channel.id)} (${inlineCode(this.channel.id)})`, inline: false },
        {
          name: lang('content'), inline: false,
          value: this.content || (this.embeds.length ? lang('events.logger.embeds', this.embeds.length) : lang('global.unknown'))
        },
        { name: lang('author'), value: `${member.user.tag} (${inlineCode(member.id)})`, inline: false }
      ],
      timestamp: Date.now(),
      color: GREY
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