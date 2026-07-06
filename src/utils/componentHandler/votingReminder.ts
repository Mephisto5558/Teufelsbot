import { ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

import type { ActionRow, ButtonComponent, ButtonInteraction } from 'discord.js';
import type { ComponentReturnType } from './index.ts';

export default async function votingReminder<MODE extends 'enable' | 'disable'>(
  this: ButtonInteraction<'raw'> & {
    customId: `votingReminder.${MODE}`;
    message: {
      components: [ActionRow<ButtonComponent>];
    };
  },
  lang: lang, mode: MODE
): ComponentReturnType {
  lang.config.backupPaths[0] = 'others.timeEvents.votingReminder';

  await this.deferReply({ flags: MessageFlags.Ephemeral });
  await this.user.updateDB('votingReminderDisabled', mode == 'disable');

  const button = ButtonBuilder.from(this.message.resolveComponent(`votingReminder.${mode}`));
  if (mode == 'disable') {
    button.setLabel(lang('buttonLabelEnable'));
    button.data.style = ButtonStyle.Success;
    button.setCustomId('votingReminder.enable');
  }
  else {
    button.setLabel(lang('buttonLabelDisable'));
    button.data.style = ButtonStyle.Danger;
    button.setCustomId('votingReminder.disable');
  }

  await this.message.edit({ components: this.message.components });
  return this.editReply(lang(`${mode}d`));
}