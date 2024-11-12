/* eslint camelcase: [error, { allow: [ban_kick_mute] }] */

const
  { EmbedBuilder, Colors, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, DiscordAPIError, GuildEmoji, StringSelectMenuBuilder } = require('discord.js'),
  checkTargetManageable = require('../checkTargetManageable.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json'),
  { ban_kick_mute } = require('../combinedCommands');

/** @type {import('.').infoCMDs}*/
module.exports = async function infoCMDs(lang, id, mode, entityType) {
  if (entityType != 'members' && mode != 'addToGuild') await this.deferReply();

  lang.__boundArgs__[0].backupPath = `events.command.infoCMDs.${entityType}`;

  const
    embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red }),
    item = await this.guild[entityType].fetch(id).catch(err => {
      if (![DiscordAPIErrorCodes.UnknownMember, DiscordAPIErrorCodes.UnknownRole, DiscordAPIErrorCodes.UnknownEmoji].includes(err.code))
        throw err;
    });

  if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], ephemeral: true });

  const entityTypeSingular = entityType.slice(0, -1);

  switch (entityType) {
    case 'members': {
      if (!this.member.permissions.has(PermissionFlagsBits[mode == 'kick' ? 'KickMembers' : 'BanMembers']))
        return this.reply({ embeds: [embed.setDescription(lang('global.noPermUser'))], ephemeral: true });
      const err = checkTargetManageable.call(this, item);
      if (err) return this.reply({ embeds: [embed.setDescription(lang(err))], ephemeral: true });

      const modal = new ModalBuilder({
        title: lang('modalTitle'),
        customId: 'infoCMDs_punish_reason_modal',
        components: [new ActionRowBuilder({
          components: [new TextInputBuilder({
            label: lang('modalTextLabel'),
            maxLength: 500,
            customId: 'infoCMDs_punish_reason_modal_text',
            style: TextInputStyle.Short
          })]
        })]
      });

      lang.__boundArgs__[0].backupPath = `commands.moderation.${mode}`;

      void this.showModal(modal);
      const submit = await this.awaitModalSubmit({ time: 30_000 }).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; });
      if (!submit) return;

      this.commandName = mode;
      this.options = { getMember: () => item, getString: () => submit.fields.getTextInputValue('infoCMDs_punish_reason_modal_text'), getNumber: () => 0 };
      this.editReply = this.followUp.bind(this);

      await submit.deferUpdate();
      ban_kick_mute.call(this, lang);
      break;
    }

    case 'emojis':
      if (mode == 'addToGuild') {
        const components = [
          new ActionRowBuilder({ components: this.message.components[0].components.filter(e => !e.customId?.includes('addToGuild')).map(e => e.data) }),
          new ActionRowBuilder({
            components: [new StringSelectMenuBuilder({
              customId: `infoCMDs.${id}.addToSelectedGuild.emojis`,
              minValues: 1,
              options: this.client.guilds.cache.filter(e => e.members.cache.has(this.user.id) && !e.emojis.cache.has(item.id)).map(e => ({ label: e.name, value: e.id })),
              placeholder: lang('add.selectMenuPlaceholder')
            })]
          })
        ];

        return this.update({ components });
      }
      else if (mode == 'addToSelectedGuild') {
        if (!this.isStringSelectMenu() || !(item instanceof GuildEmoji)) return; // typeguard

        for (const guildId of this.values) {
          let
            /** @type {import('discord.js').Guild|undefined}*/guild,
            /** @type {import('discord.js').GuildMember | undefined}*/guildMember;

          try {
            guild = await this.client.guilds.fetch(guildId);
            guildMember = await guild.members.fetch(this.user.id);
          }
          catch (err) {
            if (err.code == DiscordAPIErrorCodes.UnknownGuild) return this.customReply({ embeds: [embed.setDescription(lang('unknownGuild'))] });
            if (err.code == DiscordAPIErrorCodes.UnknownMember) return this.customReply({ embeds: [embed.setDescription(lang('notAMember'))] });

            throw err;
          }

          if (!guildMember.permissions.has(PermissionFlagsBits.ManageGuildExpressions))
            return this.customReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
          if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageGuildExpressions))
            return this.customReply({ embeds: [embed.setDescription(lang('noPerm'))] });
          if (guild.emojis.cache.has(id))
            return this.editReply({ embeds: [embed.setDescription(lang('commands.useful.addemoji.isGuildEmoji'))] });

          await guild.emojis.create({
            attachment: item.imageURL(), name: item.name,
            reason: `emoji add to server button in /${entityTypeSingular}info, member ${this.user.tag}, server ${this.guild.id}`, user: this.user.tag
          });
        }

        return this.editReply(lang('add.success'));
      }
      else if (mode == 'delete') {
        if (!this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
        if (!item.deletable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
      }

      break;

    case 'roles':
      if (item.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId || !this.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
      if (!item.editable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
      break;

    default: throw new Error('Unsupported mode');
  }

  if (mode == 'delete') {
    await item.delete(`${entityTypeSingular} delete button in /${entityTypeSingular}info, member ${this.user.tag}`);
    void this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
  }

  for (const button of this.message.components[0].components) button.data.disabled = true;
  return this.message.edit({ components: this.message.components }).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; }); // todo check specific error code
};