/**
 * @import { ButtonComponent } from 'discord.js'
 * @import { votingReminder } from '.' */

const { ButtonStyle, MessageFlags } = require('discord.js');

/** @type {votingReminder} */
module.exports = async function votingReminder(lang, mode) {
  lang.config.backupPaths[0] = 'others.timeEvents.votingReminder';

  await this.deferReply({ flags: MessageFlags.Ephemeral });
  await this.user.updateDB('votingReminderDisabled', mode == 'disable');

  /** @type {ButtonComponent} */
  const button = this.message.resolveComponent(`votingReminder.${mode}`);
  if (mode == 'disable') {
    button.label = lang('buttonLabelEnable');
    button.style = ButtonStyle.Success;
    button.customId = 'votingReminder.enable';
  }
  else {
    button.label = lang('buttonLabelDisable');
    button.style = ButtonStyle.Danger;
    button.customId = 'votingReminder.disable';
  }

  await this.message.edit({ components: this.message.components });
  return this.editReply(lang(`${mode}d`));
};