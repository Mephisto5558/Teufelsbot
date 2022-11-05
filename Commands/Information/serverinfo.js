const
  { EmbedBuilder, GuildDefaultMessageNotifications, ChannelType, GuildPremiumTier, GuildVerificationLevel, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

module.exports = {
  name: 'serverinfo',
  aliases: { prefix: ['server-info', 'guildinfo', 'guild-info'], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async function (lang) {
    const
      guild = this.guild,
      channels = Array.from(guild.channels.cache.values()),
      embed = new EmbedBuilder({
        title: guild.name,
        description: guild.description,
        color: parseInt((await getAverageColor(guild.iconURL())).hex.substring(1), 16),
        image: { url: guild.bannerURL({ size: 1024 }) },
        thumbnail: { url: guild.iconURL() },
        fields: [
          { name: lang('members'), value: `${lang('global.user')}: \`${guild.members.cache.filter(e => !e.user.bot).size}\`, Bots: \`${guild.members.cache.filter(e => e.user.bot).size}\``, inline: true },
          { name: lang('verificationLevel'), value: GuildVerificationLevel[guild.verificationLevel], inline: true },
          { name: 'ID', value: `\`${guild.id}\``, inline: true },
          { name: lang('createdAt'), value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`, inline: true },
          { name: lang('defaultNotifications'), value: GuildDefaultMessageNotifications[guild.defaultMessageNotifications], inline: true },
          { name: lang('owner'), value: `<@${guild.ownerId}>`, inline: true },
          { name: lang('memberCount'), value: `\`${guild.memberCount}\``, inline: true },
          { name: lang('locale'), value: guild.preferredLocale, inline: true },
          { name: lang('partnered'), value: guild.partnered, inline: true },
          { name: lang('emojis'), value: `\`${guild.emojis.cache.size}\``, inline: true },
          { name: lang('roles'), value: `\`${guild.roles.cache.size}\``, inline: true },
          { name: lang('boosts'), value: `\`${guild.premiumSubscriptionCount}\`${guild.premiumTier ? ', ' + GuildPremiumTier[guild.premiumTier].replace(/(\d)/, ' $1') : ''}`, inline: true },
          {
            name: lang('channels'), value: (() => {
              const sorted = {};
              channels.map(({ type }) => sorted[type] = sorted[type] ? sorted[type] + 1 : 1);
              return Object.entries(sorted).map(([k, v]) => `${ChannelType[k].replace('Guild', '')} ${lang('channels')}: \`${v}\``).join(', ');
            })(),
            inline: false
          },
          guild.vanityURLCode && (
            { name: 'Vanity URL', value: guild.vanityURLCode, inline: true },
            { name: `Vanity URL ${lang('uses')}`, value: guild.vanityURLUses, inline: true }
          )
        ].filter(Boolean)
      });

    const component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          label: lang('downloadIcon'),
          style: ButtonStyle.Link,
          url: guild.iconURL({ size: 2048 })
        })
      ]
    });

    if (guild.banner) component.components.push(new ButtonBuilder({
      label: lang('downloadBanner'),
      style: ButtonStyle.Link,
      url: guild.bannerURL({ size: 2048 })
    }));

    this.customReply({ embeds: [embed], components: [component] });
  }
};