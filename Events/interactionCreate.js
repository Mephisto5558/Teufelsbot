const { componentHandler, autocompleteGenerator, commandExecutionWrapper } = require('../Utils');

/** @this {import('discord.js').Interaction}*/
module.exports = function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const
    locale = this.guild?.db.config?.lang ?? this.guild?.localeCode,

    /** @type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale, backupPath: 'events.command' });

  if (this.isMessageComponent()) return componentHandler.call(this, lang);

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.isAutocomplete()) return this.respond(autocompleteGenerator.call(this, command, locale));

  if (this.isCommand()) return commandExecutionWrapper.call(this, command, 'slash', lang);
};