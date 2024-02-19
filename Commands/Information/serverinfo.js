const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

/** @type {command<'both'>}*/
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

  run: async function (lang) {
    const
      guild = this.client.guilds.cache.get(this.options?.getString('guild_id') ?? this.args?.[0]) ?? this.guild,
      channels = [...(await guild.channels.fetch()).values()],
      embed = new EmbedBuilder({
        title: guild.name,
        description: guild.description,
        color: guild.icon ? Number.parseInt((await getAverageColor(guild.iconURL())).hex.slice(1), 16) : Colors.White,
        thumbnail: { url: guild.iconURL() },
        image: { url: guild.bannerURL({ size: 1024 }) },
        fields: [
          { name: lang('members'), value: lang('memberStats', {
            all: guild.memberCount,
            ...(await guild.members.fetch()).reduce((acc, e) => { acc[e.user.bot ? 'bots' : 'humans']++; return acc; }, { humans: 0, bots: 0 })
          }), inline: true },
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
          {
            name: lang('channels'), inline: false,
            value: Object.entries(channels.reduce((acc, { type }) => ({ ...acc, [type]: (acc[type] ?? 0) + 1 }), {}))
              .map(([k, v]) => `${lang('others.ChannelTypes.plural.' + k)}: \`${v}\``).join(', ')
          }
        ]
      });

    if (guild.vanityURLCode) {
      embed.data.fields = [...embed.data.fields,
        { name: lang('vanityUrl'), value: guild.vanityURLCode, inline: true },
        { name: lang('vanityUrl') + lang('uses'), value: guild.vanityURLUses, inline: true }];
    }

    const component = new ActionRowBuilder();
    if (guild.icon) {
      component.components.push(new ButtonBuilder({
        label: lang('downloadIcon'),
        style: ButtonStyle.Link,
        url: guild.iconURL({ size: 2048 })
      }));
    }

    if (guild.banner) {
      component.components.push(new ButtonBuilder({
        label: lang('downloadBanner'),
        style: ButtonStyle.Link,
        url: guild.bannerURL({ size: 2048 })
      }));
    }

    return this.customReply({ embeds: [embed], components: component.components.length ? [component] : null });
  }
};