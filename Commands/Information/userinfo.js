/** @import { GuildMember } from 'discord.js' */

const
  {
    ALLOWED_SIZES, ActionRowBuilder, ActivityType, ButtonBuilder,
    ButtonStyle, EmbedBuilder, PermissionFlagsBits, TimestampStyles, hyperlink, inlineCode
  } = require('discord.js'),
  { Command, permissionTranslator } = require('@mephisto5558/command'),
  { getAverageColor } = require('fast-average-color-node'),
  { getTargetMembers, getAge, timeFormatter: { msInSecond, timestamp } } = require('#Utils');

/**
 * @param {GuildMember} member
 * @param {lang} lang */
function getMemberType(member, lang) {
  let type = member.user.bot ? 'Bot, ' : '';
  if (member.guild.ownerId == member.id) type += lang('guildOwner');
  else if (member.permissions.has(PermissionFlagsBits.Administrator)) type += lang('guildAdmin');
  else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) type += lang('guildMod');
  else type += lang('guildMember');

  return type;
}

module.exports = new Command({
  types: ['slash', 'prefix'],
  aliases: { prefix: ['user-info'] },
  cooldowns: { user: msInSecond },
  options: [{ name: 'target', type: 'User' }],

  async run(lang) {
    const
      member = getTargetMembers(this, { returnSelf: true }),
      birthday = this.client.db.get('userSettings', `${member.id}.birthday`),
      status = member.presence?.activities.find(e => e.type == ActivityType.Custom && !!e.state),
      type = getMemberType(member, lang);

    // force-fetch is required to fetch a user banner: https://discord.js.org/docs/packages/discord.js/main/User:Class#banner
    if (!member.banner && !member.user.banner) await member.fetch(true);

    const
      embed = new EmbedBuilder({
        title: member.user.tag,
        description: (status ? `${lang('activity.4', status.state)}\n` : '') + (
          member.presence?.activities.reduce((acc, e) => {
            if (e.type != ActivityType.Custom) acc.push(lang(`activity.${e.type}`, e.name));
            return acc;
          }, []).unique().join(', ') ?? ''
        ),
        color: Number.parseInt((await getAverageColor(member.displayAvatarURL())).hex.slice(1), 16),
        thumbnail: { url: member.displayAvatarURL() },
        /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 3rd largest resolution */
        image: { url: member.displayBannerURL({ size: ALLOWED_SIZES.at(-3) }) },
        footer: { text: member.id },
        fields: [
          [lang('mention'), member.user.toString()],
          [lang('displayName'), member.displayName],
          [lang('type'), type],
          [
            lang('position'),
            `${inlineCode(this.guild.roles.highest.position - member.roles.highest.position + 1)}, ${member.roles.highest.toString()}`
          ],
          [lang('roles'), inlineCode(member.roles.cache.size)],
          [lang('color'), hyperlink(member.displayHexColor, `https://www.color-hex.com/color/${member.displayHexColor.slice(1)}`)],
          [lang('createdAt'), timestamp(member.user.createdTimestamp)],
          [lang('joinedAt'), timestamp(member.joinedTimestamp)]
        ].map(([k, v]) => ({ name: k, value: v, inline: true }))
      }),
      components = [new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('downloadAvatar'),
            style: ButtonStyle.Link,
            url: member.displayAvatarURL({ size: ALLOWED_SIZES.at(-1) })
          })
        ]
      })];

    if (birthday) {
      embed.data.fields.push({
        name: lang('birthday'), inline: true,
        value: `${timestamp(birthday, TimestampStyles.LongDate)} (${getAge(birthday)})`
      });
    }
    if (member.isCommunicationDisabled())
      embed.data.fields.push({ name: lang('timedOutUntil'), value: timestamp(member.communicationDisabledUntilTimestamp), inline: true });
    if (member.user.flags.bitfield) {
      embed.data.fields.push({
        name: lang('flags.name'), inline: false,
        value: member.user.flags.toArray().map(e => inlineCode(lang(`flags.${e}`))).join(', ')
      });
    }
    embed.addFields(
      {
        name: lang('rolesWithPerms'), inline: false,
        value: [...member.roles.cache.values()]
          .filter(e => e.permissions.bitfield != 0 && e.name != '@everyone')
          .toSorted((a, b) => b.position - a.position)
          .join(', ')
      },
      {
        name: lang('perms'), inline: false,
        value: `${member.permissions.has(PermissionFlagsBits.Administrator)
          ? inlineCode(lang('admin'))
          : permissionTranslator(member.permissions.toArray(), lang.config.locale, this.client.i18n).map(inlineCode).join(', ')
        } (${member.permissions.toArray().length})`
      }
    );

    if (member.banner || member.user.banner) {
      components[0].components.push(new ButtonBuilder({
        label: lang('downloadBanner'),
        style: ButtonStyle.Link,
        url: member.displayBannerURL({ size: ALLOWED_SIZES.at(-1) })
      }));
    }

    if (member.bannable && (this.member.roles.highest.position > member.roles.highest.position || this.user.id == this.guild.ownerId)) {
      const component = new ActionRowBuilder();

      if (this.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        component.components.push(new ButtonBuilder({
          label: lang('kickMember'),
          customId: `infoCMDs.${member.id}.kick.members`,
          style: ButtonStyle.Danger
        }));
      }

      if (this.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        component.components.push(new ButtonBuilder({
          label: lang('banMember'),
          customId: `infoCMDs.${member.id}.ban.members`,
          style: ButtonStyle.Danger
        }));
      }

      if (component.components.length) components.push(component);
    }

    return this.customReply({ embeds: [embed], components });
  }
});