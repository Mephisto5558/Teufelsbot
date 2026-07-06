/* eslint-disable @eslint-community/eslint-comments/no-use -- This casing is used to better display the commandName. */
/* eslint camelcase: [error, { allow: [ban_kick_mute] }] -- This casing is used to better display the commandName. */

import {
  ActionRowBuilder, Colors, DiscordAPIError, EmbedBuilder, MessageFlags,
  ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle
} from 'discord.js';
import { Permission, isCodedError } from '@mephisto5558/command';
import checkTargetManageable from '../checkTargetManageable.ts';
import { ban_kick_mute } from '../combinedCommands/index.ts';
import { auditLogReasonMaxLength } from '../constants.ts';
import { secToMs } from '../toMs.ts';
import DiscordAPIErrorCodes from '../DiscordAPIErrorCodes.json' with { type: 'json' };

import type { ActionRow, ButtonComponent, GuildEmoji, GuildMember, Role, StringSelectMenuComponent, StringSelectMenuInteraction } from 'discord.js';
import type { GuildButtonInteraction, Response } from './index.ts';

type ManagerFn = (this: ThisParameterType<typeof infoCMDs>, embed: EmbedBuilder, mode: string, item: never, lang: lang) => Promise<unknown>;

const
  MODALSUBMIT_MAXTIME = secToMs(30), /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 30s */
  getNoPermEmbed = (embed: EmbedBuilder, lang: lang): EmbedBuilder => embed.setDescription(lang('global.noPermUser')),

  manageFunctions: Record<string, ManagerFn> = {
    async members(embed, mode, member: GuildMember, lang) {
      if (!this.member.permissions.has(mode == 'kick' ? Permission.KickMembers : Permission.BanMembers))
        return this.reply({ embeds: [getNoPermEmbed(embed, lang)], flags: MessageFlags.Ephemeral });
      const err = checkTargetManageable.call(this, member);
      if (err) return this.reply({ embeds: [embed.setDescription(lang(err))], flags: MessageFlags.Ephemeral });

      const modal = new ModalBuilder({
        title: lang('modalTitle'),
        customId: 'infoCMDs_punish_reason_modal',
        components: [new ActionRowBuilder({
          components: [new TextInputBuilder({
            label: lang('modalTextLabel'),
            maxLength: auditLogReasonMaxLength,
            customId: 'infoCMDs_punish_reason_modal_text',
            style: TextInputStyle.Short
          })]
        })]
      });

      lang.config.backupPaths.push(`commands.moderation.${mode}`);

      void this.showModal(modal);
      const submit = await this.awaitModalSubmit({ time: MODALSUBMIT_MAXTIME }).catch(err => {
        if (err instanceof DiscordAPIError) return;
        throw err;
      });
      if (!submit) return;

      this.commandName = mode;
      this.options = {
        getMember: () => member,
        getString: () => submit.fields.getTextInputValue('infoCMDs_punish_reason_modal_text'),
        getNumber: () => 0
      };
      this.editReply = this.followUp.bind(this);

      await submit.deferUpdate();
      await ban_kick_mute.call(this, lang);
    },

    async emojis(embed, mode, emoji: GuildEmoji, lang) {
      switch (mode) {
        case 'addToGuild': {
          const components = [
            new ActionRowBuilder({
              components: this.message.components[0].components.filter(e => e.customId != this.customId).map(e => e.data)
            }),
            new ActionRowBuilder({
              components: [new StringSelectMenuBuilder({
                customId: `infoCMDs.${emoji.id}.addToSelectedGuild.emojis`,
                minValues: 1,
                options: this.client.guilds.cache
                  .filter(e => e.members.cache.has(this.user.id) && !e.emojis.cache.has(emoji.id))
                  .map(e => ({ label: e.name, value: e.id })),
                placeholder: lang('add.selectMenuPlaceholder')
              })]
            })
          ];

          return this.update({ components });
        }
        case 'addToSelectedGuild':
          if (!this.isStringSelectMenu()) return; // typeguard

          for (const guildId of this.values) {
            let guild, guildMember;

            try {
              guild = await this.client.guilds.fetch(guildId);
              guildMember = await guild.members.fetch(this.user.id);
            }
            catch (err) {
              if (err.code == DiscordAPIErrorCodes.UnknownGuild) return this.customReply({ embeds: [embed.setDescription(lang('unknownGuild'))] });
              if (err.code == DiscordAPIErrorCodes.UnknownMember) return this.customReply({ embeds: [embed.setDescription(lang('notAMember'))] });

              throw err;
            }

            if (!guildMember.permissions.has(Permission.ManageGuildExpressions))
              return this.customReply({ embeds: [getNoPermEmbed(embed, lang)] });
            if (!guild.members.me.permissions.has(Permission.ManageGuildExpressions))
              return this.customReply({ embeds: [embed.setDescription(lang('noPerm'))] });
            if (guild.emojis.cache.has(emoji.id))
              return this.editReply({ embeds: [embed.setDescription(lang('commands.useful.addemoji.isGuildEmoji'))] });

            await guild.emojis.create({
              attachment: emoji.imageURL(), name: emoji.name,
              reason: `emoji add to server button in /emojiinfo, member ${this.user.tag}, server ${this.guild.id}`, user: this.user.tag
            });
          }

          return this.editReply(lang('add.success'));

        case 'delete':
          if (!this.member.permissions.has(Permission.ManageGuildExpressions))
            return this.editReply({ embeds: [getNoPermEmbed(embed, lang)] });
          if (!emoji.deletable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

          await emoji.delete(`emoji delete button in /emojiinfo, member ${this.user.tag}`);
          return this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
      }
    },

    async roles(embed, mode, role: Role, lang) {
      if (mode != 'delete') return;

      if (
        role.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId
        || !this.member.permissions.has(Permission.ManageRoles)
      ) return this.editReply({ embeds: [getNoPermEmbed(embed, lang)] });

      if (!role.editable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

      await role.delete(`role delete button in /roleinfo, member ${this.user.tag}`);
      return this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
    }
  };

export default async function infoCMDs<
  ID extends Snowflake,
  MODE extends 'kick' | 'ban' | 'delete' | 'addToGuild' | 'addToSelectedGuild',
  ENTITY_TYPE extends 'members' | 'emojis' | 'roles'
>(
  this: (MODE extends 'addToSelectedGuild' ? StringSelectMenuInteraction<'cached'> : GuildButtonInteraction) & {
    customId: `infoCMDs.${ID}.${MODE}.${ENTITY_TYPE}`;
    message: {
      components: [ActionRow<MODE extends 'addToSelectedGuild' ? StringSelectMenuComponent : ButtonComponent>];
    };
  },
  lang: lang, id: ID, mode: MODE, entityType: ENTITY_TYPE
): Promise<Response<true>> {
  if (entityType != 'members' && mode != 'addToGuild') await this.deferReply();

  lang.config.backupPaths[0] = `events.command.infoCMDs.${entityType}`;

  const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });
  let item;

  try { item = await this.guild[entityType].fetch(id); }
  catch (err) {
    if (!isCodedError(err, [DiscordAPIErrorCodes.UnknownMember, DiscordAPIErrorCodes.UnknownRole, DiscordAPIErrorCodes.UnknownEmoji]))
      throw err;
  }

  if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], flags: MessageFlags.Ephemeral });

  await manageFunctions[entityType].call(this, embed, mode, item, lang);

  for (const button of this.message.components[0].components) button.data.disabled = true;
  return this.message.edit({ components: this.message.components }).catch(err => {
    if (err instanceof DiscordAPIError || err.code == DiscordAPIErrorCodes.UnknownMessage) return;
    throw err;
  });
}