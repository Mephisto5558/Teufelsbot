const
  { EmbedBuilder, Colors, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js'),
  checkTarget = require('../checkTargetBanPerm.js'),
  bankick = require('../bankick.js');

/** this.customId: `infoCMDs.<id>.<action>.<entitytype>`
 * @this {import('discord.js').ButtonInteraction} @param {string}initiatorId @param {string}opponentId*/
module.exports = async function infoCMDs(lang, id, mode, entityType) {
  if (entityType != 'members') await this.deferReply();

  lang.__boundArgs__[0].backupPath = `events.command.infoCMDs.${entityType}`;

  const
    embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red }),
    item = await this.guild[entityType].fetch(id).catch(() => { });

  if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], ephemeral: true });

  switch (entityType) {
    case 'members': {
      if (!this.member.permissions.has(PermissionFlagsBits[mode == 'kick' ? 'KickMembers' : 'BanMembers'])) return this.reply({ embeds: [embed.setDescription(lang('global.noPermUser'))], ephemeral: true });
      const err = checkTarget.call(this, item, lang);
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
      const submit = await this.awaitModalSubmit({ time: 30000 }).catch(() => { });
      if (!submit) return;
      await submit.deferUpdate();

      this.commandName = mode;
      this.options = { getMember: () => item, getString: () => submit.fields.getTextInputValue('infoCMDs_punish_reason_modal_text'), getNumber: () => 0 };
      this.editReply = this.followUp;
      lang.__boundArgs__[0].backupPath = `commands.moderation.${mode}`;

      bankick.call(this, lang);
      break;
    }
    
    case 'emojis': {
      if (!this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
      if (!item.deletable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
    }
    // fall through
    case 'roles': {
      if (!this.member.permissions.has(PermissionFlagsBits.ManageRoles) || item.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });
      if (!item.editable) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });
    }
    // fall through
    case mode == 'delete': {
      await item.delete(`${entityType.slice(0, -1)} delete button in /${entityType.slice(0, -1)}info, member ${this.user.username}`);
      this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
    }
  }

  for (const button of this.message.components[0].components) button.data.disabled = true;
  return this.message.edit({ components: this.message.components }).catch(() => { });
};