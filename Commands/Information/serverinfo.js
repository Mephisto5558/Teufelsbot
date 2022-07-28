const
  { Command } = require('reconlx'),
  { EmbedBuilder, GuildDefaultMessageNotifications, ChannelType, GuildPremiumTier, GuildVerificationLevel, Message } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

module.exports = new Command({
  name: 'serverinfo',
  aliases: { prefix: ['server-info', 'guildinfo', 'guild-info'], slash: [] },
  description: 'Get information about this guild',
  usage: 'PREFIX Command: serverinfo',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async ({ functions }, message) => {
    const channels = Array.from(message.guild.channels.cache.values());

    const
      embed = new EmbedBuilder({
        title: message.guild.name,
        description: message.guild.description,
        color: parseInt((await getAverageColor(message.guild.iconURL())).hex.substring(1), 16),
        fields: [
          { name: 'Members', value: `User: \`${message.guild.members.cache.filter(e => !e.user.bot).size}\`, Bots: \`${message.guild.members.cache.filter(e => e.user.bot).size}\``, inline: true },
          { name: 'Verification Level', value: GuildVerificationLevel[message.guild.verificationLevel], inline: true },
          { name: 'ID', value: `\`${message.guild.id}\``, inline: true },
          { name: 'Created At', value: `<t:${Math.round(message.guild.createdTimestamp / 1000)}>`, inline: true },
          { name: 'Default Notifications', value: GuildDefaultMessageNotifications[message.guild.defaultMessageNotifications], inline: true },
          { name: 'Owner', value: `<@${message.guild.ownerId}>`, inline: true },
          { name: 'Member Count', value: `\`${message.guild.memberCount}\``, inline: true },
          { name: 'Locale', value: message.guild.preferredLocale, inline: true },
          { name: 'Partnered', value: message.guild.partnered, inline: true },
          { name: 'Emojis', value: `\`${message.guild.emojis.cache.size}\``, inline: true },
          { name: 'Roles', value: `\`${message.guild.roles.cache.size}\``, inline: true },
          { name: 'Boosts', value: `\`${message.guild.premiumSubscriptionCount}\`${message.guild.premiumTier ? `, ${GuildPremiumTier[guild.premiumTier].replace(/(\d)/, ' $1')}` : ''}`, inline: true },
          {
            name: 'Channels', value: (_ => {
              const sorted = {};
              channels.map(({ type }) => sorted[type] = sorted[type] ? sorted[type] + 1 : 1);
              return Object.entries(sorted).map(([k, v]) => `${ChannelType[k].replace('Guild', '')} Channels: \`${v}\``).join(', ');
            })(),
            inline: false
          },
          message.guild.vanityURLCode ? (
            { name: 'Vanity URL', value: message.guild.vanityURLCode, inline: true },
            { name: 'Vanity URL Uses', value: message.guild.vanityURLUses, inline: true }
          ) : null
        ].filter(e => e)
      }).setThumbnail(message.guild.iconURL());

    if (message.guild.banner) embed.setImage(message.guild.bannerURL());

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] });
  }
})
