const errorHandler = require('./error_handler.js');

/**@this Message|import('discord.js').BaseInteraction @param {command}command @param {string}commandType @param {lang}lang*/
module.exports = async function commandExecutionWrapper(command, commandType, lang) {
  /**@type {lang}*/
  const cmdLang = this.client.i18n.__.bBind(this.client.i18n, { locale: lang.__boundArgs__[0].locale, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.aliasOf ?? command.name}` : null });

  log.debug(`Executing ${commandType} command ${command.name}`);
  try {
    await command.run.call(this, cmdLang);
    if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};