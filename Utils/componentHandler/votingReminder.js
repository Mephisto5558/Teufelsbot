const { ButtonStyle } = require('discord.js');

/** @type {import('.').votingReminder} */
module.exports = async function votingReminder(lang, mode) {
  lang.__boundArgs__[0].backupPath = 'others.timeEvents.votingReminder';

  await this.deferReply({ ephemeral: true });
  await this.user.updateDB('votingReminderDisabled', mode == 'disable');

  /** @type {import('discord.js').APIButtonComponentWithCustomId} */
  const button = this.message.components[0].components[1].data;
  if (mode == 'disable') {
    button.label = lang('buttonLabelEnable');
    button.style = ButtonStyle.Success;
    button.custom_id = 'votingReminder.enable'; /* eslint-disable-line camelcase -- nothing I can do about that */
  }
  else {
    button.label = lang('buttonLabelDisable');
    button.style = ButtonStyle.Danger;
    button.custom_id = 'votingReminder.disable'; /* eslint-disable-line camelcase -- nothing I can do about that */
  }

  await this.message.edit({ components: this.message.components });
  return this.editReply(lang(`${mode}d`));
};