/** @import { InviteGuild, Invite, ChannelType } from 'discord.js' */

const
  { ALLOWED_SIZES, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Guild, inlineCode, userMention } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { getAverageColor } = require('fast-average-color-node'),
  { msInSecond, timestamp } = require('#Utils').timeFormatter;

module.exports = new Command({
  types: ['slash', 'prefix'],
  aliases: { prefix: ['server-info', 'guildinfo', 'guild-info'] },
  cooldowns: { user: msInSecond },
  options: [{
    name: 'guild_id_or_invite',
    type: 'String',
    autocompleteOptions() { return this.client.guilds.cache.filter(e => e.members.cache.has(this.member.id)).map(e => e.id); }
  }],

  async run(lang) {
    const id = this.options?.getString('guild_id_or_invite') ?? this.args?.[0];

    let
      /** @type {Guild | InviteGuild | undefined} */ guild,
      /** @type {Invite | undefined} */ invite;

    if (id) {
      guild = this.client.guilds.cache.get(id);
      if (!guild) invite = await this.client.fetchInvite(id).catch(() => { /** empty */ });
    }

    guild ??= invite?.guild ?? this.guild;

    const
      channels = guild instanceof Guild ? [...(await guild.channels.fetch()).values()] : undefined,
      embed = new EmbedBuilder({
        title: guild.name,
        description: guild.description,
        color: guild.icon ? Number.parseInt((await getAverageColor(guild.iconURL())).hex.slice(1), 16) : Colors.White,
        thumbnail: { url: guild.iconURL() },
        /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3rd largest resolution */
        image: { url: guild.bannerURL({ size: ALLOWED_SIZES.at(-3) }) },
        fields: [
          guild instanceof Guild && { name: lang('members'), value: lang('memberStats', {
            all: inlineCode(guild.memberCount),
            ...Object.fromEntries((await guild.members.fetch())
              .reduce((acc, e) => {
                acc[e.user.bot ? 0 : 1][1]++;
                return acc;
              }, [['humans', 0], ['bots', 0]])
              .map(([k, v]) => [k, inlineCode(v)]))
          }), inline: true },
          { name: lang('verificationLevel.name'), value: lang(`verificationLevel.${guild.verificationLevel}`), inline: true },
          { name: lang('id'), value: inlineCode(guild.id), inline: true },
          { name: lang('createdAt'), value: timestamp(guild.createdTimestamp), inline: true },
          ...guild instanceof Guild
            ? [
                { name: lang('defaultNotifications.name'), value: lang(`defaultNotifications.${guild.defaultMessageNotifications}`), inline: true },
                { name: lang('owner'), value: userMention(guild.ownerId), inline: true },
                { name: lang('locale'), value: guild.preferredLocale, inline: true },
                { name: lang('partnered'), value: lang(`global.${guild.partnered}`), inline: true },
                { name: lang('emojis'), value: inlineCode(guild.emojis.cache.size), inline: true },
                { name: lang('roles'), value: inlineCode(guild.roles.cache.size), inline: true }
              ]
            : [{ name: lang('partnered'), value: lang(`global.${guild.partnered}`), inline: true }],
          {
            name: lang('boosts.name'), inline: true,
            value: inlineCode(guild.premiumSubscriptionCount)
              + (guild instanceof Guild && guild.premiumTier ? lang(`boosts.${guild.premiumTier}`) : '')
          },
          channels && {
            name: lang('channels'), inline: false,
            value: Object.entries(
              channels.reduce((
                /** @type {Record<ChannelType, number | undefined>} */ acc, e
              ) => e ? { ...acc, [e.type]: (acc[e.type] ?? 0) + 1 } : acc, {})
            )
              .map((
                /** @type {[ChannelType, number]} */ [k, v]
              ) => `${lang('others.ChannelTypes.plural.' + k.toString())}: ${inlineCode(v)}`)
              .join(', ')
          }
        ]
      });

    if (guild.vanityURLCode) {
      embed.data.fields.push({ name: lang('vanityUrl'), value: guild.vanityURLCode, inline: true });
      if (guild instanceof Guild) embed.data.fields.push({ name: lang('vanityUrl') + lang('uses'), value: guild.vanityURLUses, inline: true });
    }

    const components = [];

    if (guild.icon || guild.banner) components.push(new ActionRowBuilder());
    if (guild.icon) {
      components[0].components.push(new ButtonBuilder({
        label: lang('downloadIcon'),
        style: ButtonStyle.Link,
        url: guild.iconURL({ size: ALLOWED_SIZES.at(-2) }) /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 2nd largest resolution */
      }));
    }

    if (guild.banner) {
      components[0].components.push(new ButtonBuilder({
        label: lang('downloadBanner'),
        style: ButtonStyle.Link,
        url: guild.bannerURL({ size: ALLOWED_SIZES.at(-2) }) /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 2nd largest resolution */
      }));
    }

    if (!(guild instanceof Guild)) {
      components.push(new ActionRowBuilder({ components: [new ButtonBuilder({
        label: lang('joinGuild'),
        style: ButtonStyle.Link,
        url: invite.url
      })] }));
    }

    embed.data.fields = embed.data.fields.filter(Boolean);

    return this.customReply({ embeds: [embed], components });
  }
});