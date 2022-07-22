const
  { Command } = require('reconlx'),
  { EmbedBuilder, GuildDefaultMessageNotifications, ChannelType, GuildPremiumTier, GuildVerificationLevel } = require('discord.js'),
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

  run: async ({ functions }, message, interaction) => {
    if (interaction) message = interaction;

    const channels = Array.from(message.guild.channels.cache.values());

    const
      guild = interaction?.guild || message.guild,
      embed = new EmbedBuilder({
        title: guild.name,
        description: guild.description,
        color: parseInt((await getAverageColor(guild.iconURL())).hex.substring(1), 16),
        fields: [
          { name: 'Members', value: `User: \`${guild.members.cache.filter(e => !e.user.bot).size}\`, Bots: \`${guild.members.cache.filter(e => e.user.bot).size}\``, inline: true },
          { name: 'Verification Level', value: GuildVerificationLevel[guild.verificationLevel], inline: true },
          { name: 'ID', value: `\`${guild.id}\``, inline: true },
          { name: 'Created At', value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`, inline: true },
          { name: 'Default Notifications', value: GuildDefaultMessageNotifications[guild.defaultMessageNotifications], inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Member Count', value: `\`${guild.memberCount}\``, inline: true },
          { name: 'Locale', value: guild.preferredLocale, inline: true },
          { name: 'Partnered', value: guild.partnered, inline: true },
          { name: 'Emojis', value: `\`${guild.emojis.cache.size}\``, inline: true },
          { name: 'Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
          { name: 'Boosts', value: `\`${guild.premiumSubscriptionCount}\`${guild.premiumTier ? `, ${GuildPremiumTier[guild.premiumTier].replace(/(\d)/, ' $1')}` : ''}`, inline: true },
          {
            name: 'Channels', value: (_ => {
              const sorted = {};
              channels.map(({ type }) => sorted[type] ? sorted[type]++ : sorted[type] = 1);
              return Object.entries(sorted).map(([k, v]) => `${ChannelType[k].replace('Guild', '')} Channels: \`${v}\``).join(', ');
            })(),
            inline: false
          },
          guild.vanityURLCode ? (
            { name: 'Vanity URL', value: guild.vanityURLCode, inline: true },
            { name: 'Vanity URL Uses', value: guild.vanityURLUses, inline: true }
          ) : null
        ].filter(e => e)
      }).setThumbnail(guild.iconURL());

    if (guild.banner) embed.setImage(guild.bannerURL());

    interaction ? interaction.editReply({ embeds: [embed] }) : functions.reply({ embeds: [embed] }, message);
  }
})