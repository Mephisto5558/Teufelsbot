const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

module.exports = new Command({
  name: 'serverinfo',
  aliases: ['server-info', 'guildinfo', 'guild-info'],
  description: 'Get information about this guild',
  usage: 'PREFIX COMMAND: serverinfo',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (client, message, interaction) => {
    if (interaction) message = interaction;

    let channels = Array.from(message.guild.channels.cache.values());

    const
      guild = interaction?.guild || message.guild,
      filter = type => {
        const newChannels = channels.filter(e => e.type != type);
        const length = channels.length - newChannels.length;
        channels = newChannels;
        return length;
      },
      embed = new MessageEmbed({
        title: guild.name,
        description: guild.description,
        color: (await getAverageColor(guild.iconURL({ dynamic: true }))).hex,
        fields: [
          ['Members', `User: \`${guild.members.cache.filter(e => !e.user.bot).size}\`, Bots: \`${guild.members.cache.filter(e => e.user.bot).size}\``],
          ['Verification Level', guild.verificationLevel],
          ['ID', `\`${guild.id}\``],
          ['Created At', `<t:${Math.round(guild.createdTimestamp / 1000)}>`],
          ['Default Notifications', guild.defaultMessageNotifications],
          ['Owner', `<@${guild.ownerId}>`],
          ['Member Count', guild.memberCount],
          ['Locale', guild.preferredLocale],
          ['Partnered', guild.partnered],
          ['Emojis', guild.emojis.cache.size],
          ['Roles', guild.roles.cache.size],
          ['Boosts', `${guild.premiumSubscriptionCount}${guild.premiumTier == 'NONE' ? `, ${guild.premiumTier.replace('_', ' ').replace('NONE', '')}` : ''}`],
          ['Channels',
            `All Channels: \`${channels.length}\`\n` +
            `Category Channels: \`${filter('GUILD_CATEGORY')}\`, ` +
            `Message Channels: \`${filter('GUILD_TEXT')}\`,\n ` +
            `Voice Channels: \`${filter('GUILD_VOICE')}\`, ` +
            `Thread Channels: \`${filter('GUILD_THREAD')}\`, ` +
            `Other Channels: \`${channels.length}\``,
            false
          ]
        ].map(e => { return { name: e[0], value: e[1].toString(), inline: !(e[2] === false) } })
      })
        .setThumbnail(guild.iconURL({ dynamic: true }));

    if (guild.banner) embed.setImage(`https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp`);
    if (guild.vanityURLCode) {
      embed.addField('Vanity URL', guild.vanityURLCode, true)
      embed.addField('Vanity URL Uses', guild.vanityURLUses, true)
    }

    interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
  }
})