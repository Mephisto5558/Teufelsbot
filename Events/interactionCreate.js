const { autocompleteGenerator, commandExecutionWrapper, componentHandler } = require('#Utils');

/** @this {import('discord.js').ClientEvents['interactionCreate'][0]} */
module.exports = async function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const
    locale = this.inGuild() ? this.guild.db.config.lang ?? this.guild.localeCode : this.user.localeCode,
    lang = this.client.i18n.getTranslator({ locale, backupPaths: ['events.command'] });

  if (this.isMessageComponent()) return componentHandler.call(this, lang);

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.isAutocomplete()) return this.respond(autocompleteGenerator.call(this, command, this.focused, locale));

  if (this.isCommand()) return commandExecutionWrapper.call(this, command, 'slash', lang);
};