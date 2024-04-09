const
  { EmbedBuilder, Colors } = require('discord.js'),
  checkForErrors = require('./checkForErrors.js'),
  errorHandler = require('./errorHandler.js');


/**
 * @this {Message|import('discord.js').BaseInteraction}
 * @param {command<'both', boolean, true>}command
 * @param {string}commandType
 * @param {lang}lang*/
module.exports = async function commandExecutionWrapper(command, commandType, lang) {
  const errorKey = await checkForErrors.call(this, command, lang);
  if (errorKey === true) return;
  else if (errorKey) return this.customReply({ embeds: [new EmbedBuilder({ description: lang(...errorKey), color: Colors.Red })], ephemeral: true });

  const
    commandName = command.aliasOf ?? command.name,

    /** @type {lang}*/
    cmdLang = this.client.i18n.__.bBind(this.client.i18n, { locale: lang.__boundArgs__[0].locale, backupPath: command ? `commands.${command.category}.${commandName}` : undefined });

  log.debug(`Executing ${commandType} command ${commandName}`);

  if (!command.noDefer && this.replied === false) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false }); // `=== false` because of Messages

  try {
    await command.run.call(this, cmdLang);
    if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${commandName}.${commandType}`, (this.client.settings.stats[commandName]?.[commandType] ?? 0) + 1);
  }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};