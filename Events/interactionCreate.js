const
  { EmbedBuilder, Colors, InteractionType } = require('discord.js'),
  { errorHandler, componentHandler, autocompleteGenerator, checkForErrors } = require('../Utils');

/**@this import('discord.js').Interaction*/
module.exports = async function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const locale = this.guild?.db.config?.lang ?? this.guild?.localeCode;
  if (this.type == InteractionType.MessageComponent) return componentHandler.call(this, this.client.i18n.__.bBind(this.client.i18n, { locale, backupPath: 'events.command' }));

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.type == InteractionType.ApplicationCommandAutocomplete) return this.respond(await autocompleteGenerator.call(this, command, locale));

  const
    /**@type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale, backupPath: 'events.command' }),
    errorKey = await checkForErrors.call(this, command, lang);

  if (errorKey === true) return;
  else if (errorKey) return this.customReply({ embeds: [new EmbedBuilder({ description: lang(...errorKey), color: Colors.Red })], ephemeral: true });

  if (this.type == InteractionType.ApplicationCommand) {
    if (!command.noDefer && !this.replied) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false });
    const cmdLang = this.client.i18n.__.bBind(this.client.i18n, { locale, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.aliasOf ?? command.name}` : null });
    
    try {
      log.debug(`Executing slash command ${command.name}`);
      command.run.call(this, cmdLang)?.catch(err => errorHandler.call(this.client, err, this, lang));
      if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
    } catch (err) { errorHandler.call(this.client, err, this, lang); }
  }
};