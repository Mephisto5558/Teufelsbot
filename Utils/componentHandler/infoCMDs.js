/* eslint camelcase: [error, { allow: [ban_kick_mute] }] */
/**
 * @typedef {(this: ThisParameterType<import('.').infoCMDs>, embed: EmbedBuilder, mode: string, item: Item) => Promise<unknown>} ManagerFn
 * @template {unknown} Item */

const
  {
    EmbedBuilder, Colors, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,
    DiscordAPIError, GuildEmoji, StringSelectMenuBuilder, MessageFlags
  } = require('discord.js'),
  { ban_kick_mute } = require('../combinedCommands'),
  { auditLogReasonMaxLength } = require('../constants.js'),
  { secToMs } = require('../toMs.js'),
  checkTargetManageable = require('../checkTargetManageable.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json'),
  MODALSUBMIT_MAXTIME = secToMs(30), /* eslint-disable-line @typescript-eslint/no-magic-numbers */

  manageFunctions = {
    /** @type {ManagerFn<import('discord.js').GuildMember>} */
    async manageMember(embed, mode, member) {
      if (!this.member.permissions.has(PermissionFlagsBits[mode == 'kick' ? 'KickMembers' : 'BanMembers']))
        return this.reply({ embeds: [embed.setDescription(lang('global.noPermUser'))], flags: MessageFlags.Ephemeral });
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
        if (!(err instanceof DiscordAPIError)) throw err;
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

    /** @type {ManagerFn<import('discord.js').GuildEmoji>} */
    async manageEmoji(embed, mode, emoji) {
      switch (mode) {
        case 'addToGuild': {
          const components = [
            new ActionRowBuilder({
              components: this.message.components[0].components.filter(e => !e.customId?.includes('addToGuild')).map(e => e.data)
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
          if (!this.isStringSelectMenu() || !(emoji instanceof GuildEmoji)) return; // typeguard

          for (const guildId of this.values) {
            let
              /** @type {import('discord.js').Guild | undefined} */ guild,
              /** @type {import('discord.js').GuildMember | undefined} */ guildMember;

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
            if (guild.emojis.cache.has(emoji.id))
              return this.editReply({ embeds: [embed.setDescription(lang('commands.useful.addemoji.isGuildEmoji'))] });

            await guild.emojis.create({
              attachment: emoji.imageURL(), name: emoji.name,
              reason: `emoji add to server button in /emojiinfo, member ${this.user.tag}, server ${this.guild.id}`, user: this.user.tag
            });
          }

          return this.editReply(lang('add.success'));

        case 'delete':
          if (!this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions))
            return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
          if (!emoji.deletable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

          await emoji.delete(`emoji delete button in /emojiinfo, member ${this.user.tag}`);
          return this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
      }
    },

    /** @type {ManagerFn<import('discord.js').Role>} */
    async manageRole(embed, mode, role) {
      if (mode != 'delete') return;

      if (
        role.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId
        || !this.member.permissions.has(PermissionFlagsBits.ManageRoles)
      ) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });

      if (!role.editable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

      await role.delete(`role delete button in /roleinfo, member ${this.user.tag}`);
      return this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
    }
  };

/** @type {import('.').infoCMDs} */
module.exports = async function infoCMDs(lang, id, mode, entityType) {
  if (entityType != 'members' && mode != 'addToGuild') await this.deferReply();

  lang.config.backupPaths[0] = `events.command.infoCMDs.${entityType}`;

  const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });
  let item;

  try { item = await this.guild[entityType].fetch(id); }
  catch (err) {
    if (![DiscordAPIErrorCodes.UnknownMember, DiscordAPIErrorCodes.UnknownRole, DiscordAPIErrorCodes.UnknownEmoji].includes(err.code))
      throw err;
  }

  if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], flags: MessageFlags.Ephemeral });

  await manageFunctions[`manage${entityType.slice(0, -1)}`].call(this, embed, mode, item);

  for (const button of this.message.components[0].components) button.data.disabled = true;
  return this.message.edit({ components: this.message.components }).catch(err => {
    if (err.code != DiscordAPIErrorCodes.UnknownMessage) throw err;
  });
};