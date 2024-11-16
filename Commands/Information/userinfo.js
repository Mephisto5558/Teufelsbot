const
  { ActivityType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node'),
  { getTargetMember, getAge, permissionTranslator } = require('#Utils');

/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: ['user-info'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'target', type: 'User' }],

  async run(lang) {
    this.args = this.args?.map(e => e.replaceAll(/[&<>@]/g, '')) ?? [];
    this.content = this.content?.replaceAll(/[&<>@]/g, '');

    const
      member = getTargetMember(this, { returnSelf: true }),
      birthday = this.client.db.get('userSettings', `${member.id}.birthday`),
      bannerURL = (await member.user.fetch()).bannerURL(),
      status = member.presence?.activities.find(e => e.type == ActivityType.Custom && e.state);

    let type = member.user.bot ? 'Bot, ' : '';

    if (member.guild.ownerId == member.id) type += lang('guildOwner');
    else if (member.permissions.has(PermissionFlagsBits.Administrator)) type += lang('guildAdmin');
    else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) type += lang('guildMod');
    else type += lang('guildMember');

    const
      embed = new EmbedBuilder({
        title: member.user.tag,
        description: (status ? lang('activity.4', status.state) : '') + (
          member.presence?.activities.reduce((/** @type {string[]}*/acc, e) => {
            if (e.type != ActivityType.Custom) acc.push(lang(`activity.${e.type}`, e.name));
            return acc;
          }, []).unique().join(', ') ?? ''
        ),
        color: Number.parseInt((await getAverageColor(member.displayAvatarURL())).hex.slice(1), 16),
        thumbnail: { url: member.displayAvatarURL() },
        image: { url: bannerURL && bannerURL + '?size=1024' },
        footer: { text: member.id },
        fields: [
          { name: lang('mention'), value: member.user.toString(), inline: true },
          { name: lang('displayName'), value: member.displayName, inline: true },
          { name: lang('type'), value: type, inline: true },
          { name: lang('position'), value: `\`${this.guild.roles.highest.position - member.roles.highest.position + 1}\`, ${member.roles.highest.toString()}`, inline: true },
          { name: lang('roles'), value: `\`${member.roles.cache.size}\``, inline: true },
          { name: lang('color'), value: `[${member.displayHexColor}](https://www.color-hex.com/color/${member.displayHexColor.slice(1)})`, inline: true },
          { name: lang('createdAt'), value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
          { name: lang('joinedAt'), value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`, inline: true }

        ]
      }),
      components = [new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('downloadAvatar'),
            style: ButtonStyle.Link,
            url: member.displayAvatarURL({ size: 2048 })
          })
        ]
      })];

    if (birthday) embed.data.fields.push({ name: lang('birthday'), value: `<t:${Math.round(birthday.getTime() / 1000)}:D> (${getAge(birthday)})`, inline: true });
    if (member.isCommunicationDisabled()) embed.data.fields.push({ name: lang('timedOutUntil'), value: `<t:${Math.round(member.communicationDisabledUntilTimestamp / 1000)}>`, inline: true });
    if (member.user.flags.bitfield) {
      embed.data.fields.push({
        name: lang('flags.name'), inline: false,
        value: '`' + member.user.flags.toArray().map(e => lang(`flags.${e}`)).join('`, `') + '`'
      });
    }
    embed.addFields(
      {
        name: lang('rolesWithPerms'), inline: false,
        value: [...member.roles.cache.values()].filter(e => e.permissions.toArray().length && e.name != '@everyone').sort((a, b) => b.position - a.position)
          .join(', ')
      },
      {
        name: lang('perms'), inline: false,
        value: `\`${member.permissions.has(PermissionFlagsBits.Administrator)
          ? lang('admin')
          : permissionTranslator(member.permissions.toArray(), lang.__boundArgs__[0].locale, this.client.i18n).join('`, `')
        }\` (${member.permissions.toArray().length})`
      }
    );

    if (bannerURL) {
      components[0].components.push(new ButtonBuilder({
        label: lang('downloadBanner'),
        style: ButtonStyle.Link,
        url: bannerURL + '?size=2048'
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
};