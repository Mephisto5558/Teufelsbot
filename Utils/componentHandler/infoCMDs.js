const
  { EmbedBuilder, Colors, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, DiscordAPIError } = require('discord.js'),
  checkTargetManageable = require('../checkTargetManageable.js'),
  ban_kick = require('../combinedCommands/ban_kick.js');

/** this.customId: `infoCMDs.<id>.<action>.<entitytype>`
 * @this import('discord.js').ButtonInteraction @param {lang}lang @param {string}id @param {string}mode @param {string}entityType*/
module.exports = async function infoCMDs(lang, id, mode, entityType) {
  if (entityType != 'members') await this.deferReply();

  lang.__boundArgs__[0].backupPath = `events.command.infoCMDs.${entityType}`;

  const
    embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red }),
    item = await this.guild[entityType].fetch(id).catch(err => { if (![10007, 10011, 10014].includes(err.code)) throw err; }); //"Unknown member/role/emoji", 

  if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], ephemeral: true });

  switch (entityType) {
    case 'members': {
      if (!this.member.permissions.has(PermissionFlagsBits[mode == 'kick' ? 'KickMembers' : 'BanMembers'])) return this.reply({ embeds: [embed.setDescription(lang('global.noPermUser'))], ephemeral: true });
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

      this.showModal(modal);
      const submit = await this.awaitModalSubmit({ time: 30000 }).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; });
      if (!submit) return;

      await submit.deferUpdate();

      this.commandName = mode;
      this.options = { getMember: () => item, getString: () => submit.fields.getTextInputValue('infoCMDs_punish_reason_modal_text'), getNumber: () => 0 };
      this.editReply = this.followUp;
      lang.__boundArgs__[0].backupPath = `commands.moderation.${mode}`;

      ban_kick.call(this, lang);
      break;
    }

    case 'emojis': {
      if (!this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
      if (!item.deletable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
    }
    // fall through
    case 'roles': {
      if (item.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId || !this.member.permissions.has(PermissionFlagsBits.ManageRoles)) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
      if (!item.editable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
    }
    // fall through
    case mode == 'delete': {
      await item.delete(`${entityType.slice(0, -1)} delete button in /${entityType.slice(0, -1)}info, member ${this.user.tag}`);
      this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
    }
  }

  for (const button of this.message.components[0].components) button.data.disabled = true;
  return this.message.edit({ components: this.message.components }).catch(err => { if (!(err instanceof DiscordAPIError)) throw err; }); //todo check specific error code
};