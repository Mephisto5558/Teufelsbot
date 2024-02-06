const errorHandler = require('./errorHandler.js');

/** 
 * @this Message|import('discord.js').BaseInteraction
 * @param {command<'both', boolean, true>}command
 * @param {string}commandType
 * @param {lang}lang*/
module.exports = async function commandExecutionWrapper(command, commandType, lang) {
  const
    commandName = command.aliasOf ?? command.name,
    cmdLang = this.client.i18n.__.bBind(this.client.i18n, { locale: lang.__boundArgs__[0].locale, backupPath: command ? `commands.${command.category.toLowerCase()}.${commandName}` : null });

  log.debug(`Executing ${commandType} command ${commandName}`);
  try {
    await command.run.call(this, cmdLang);
    if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${commandName}`, this.client.settings.stats?.[commandName] + 1 || 1);
  }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};