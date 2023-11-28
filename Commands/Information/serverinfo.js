const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

/**@type {command}*/
module.exports = {
  name: 'serverinfo',
  aliases: { prefix: ['server-info', 'guildinfo', 'guild-info'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'guild_id',
    type: 'String',
    autocompleteOptions: function () { return this.client.guilds.cache.filter(e => e.members.cache.has(this.member.id)).map(e => e.id); }
  }],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const
      guild = this.client.guilds.cache.get(this.options?.getString('guild_id') || this.args?.[0]) || this.guild,
      channels = Array.from((await guild.channels.fetch()).values()),
      embed = new EmbedBuilder({
        title: guild.name,
        description: guild.description,
        color: parseInt((await getAverageColor(guild.iconURL())).hex.substring(1), 16),
        thumbnail: { url: guild.iconURL() },
        image: { url: guild.bannerURL({ size: 1024 }) },
        fields: [
          { name: lang('members'), value: lang('memberStats', { all: guild.memberCount, humans: (await guild.members.fetch()).filter(e => !e.user.bot).size, bots: guild.members.cache.filter(e => e.user.bot).size }), inline: true },
          { name: lang('verificationLevel.name'), value: lang(`verificationLevel.${guild.verificationLevel}`), inline: true },
          { name: lang('id'), value: `\`${guild.id}\``, inline: true },
          { name: lang('createdAt'), value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`, inline: true },
          { name: lang('defaultNotifications.name'), value: lang(`defaultNotifications.${guild.defaultMessageNotifications}`), inline: true },
          { name: lang('owner'), value: `<@${guild.ownerId}>`, inline: true },
          { name: lang('locale'), value: guild.preferredLocale, inline: true },
          { name: lang('partnered'), value: lang(`global.${guild.partnered}`), inline: true },
          { name: lang('emojis'), value: `\`${guild.emojis.cache.size}\``, inline: true },
          { name: lang('roles'), value: `\`${guild.roles.cache.size}\``, inline: true },
          { name: lang('boosts.name'), value: `\`${guild.premiumSubscriptionCount}\`` + (guild.premiumTier ? lang(`boosts.${guild.premiumTier}`) : ''), inline: true },
          { name: lang('channels'), value: Object.entries(channels.reduce((acc, { type }) => ({ ...acc, [type]: (acc[type] + 1) || 1 }), {})).map(([k, v]) => `${lang('others.ChannelTypes.plural.' + k)}: \`${v}\``).join(', '), inline: false }
        ]
      });

    if (guild.vanityURLCode) embed.data.fields = embed.data.fields.concat([
      { name: lang('vanityUrl'), value: guild.vanityURLCode, inline: true },
      { name: lang('vanityUrl') + lang('uses'), value: guild.vanityURLUses, inline: true }
    ]);

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

    return this.customReply({ embeds: [embed], components: [component] });
  }
};