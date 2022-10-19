const
  { EmbedBuilder, GuildDefaultMessageNotifications, ChannelType, GuildPremiumTier, GuildVerificationLevel } = require('discord.js'),
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
        image: { url: guild.splash ? `https://cdn.discordapp.com/splashes/${guild.splash}.jpg?size=2048` : '' },
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
          guild.vanityURLCode ? (
            { name: 'Vanity URL', value: guild.vanityURLCode, inline: true },
            { name: `Vanity URL ${lang('uses')}`, value: guild.vanityURLUses, inline: true }
          ) : null
        ].filter(Boolean)
      }).setThumbnail(guild.iconURL());

    if (guild.banner) embed.setImage(guild.bannerURL());

    this.customReply({ embeds: [embed] });
  }
};