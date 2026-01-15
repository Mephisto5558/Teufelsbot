/** @import { ClientEvents } from 'discord.js' */

const
  { autocompleteGenerator, commandExecutionWrapper, commandTypes } = require('@mephisto5558/command'),
  { componentHandler } = require('#Utils');

/** @this {ClientEvents['interactionCreate'][0]} */
module.exports = async function interactionCreate() {
  if (
    this.client.settings.blacklist?.includes(this.user.id)
    || !(this.isCommand() || this.isAutocomplete() || this.isMessageComponent())
  ) return;

  const
    locale = this.inGuild() ? this.guild.db.config.lang ?? this.guild.localeCode : this.user.localeCode,
    lang = this.client.i18n.getTranslator({ locale });

  if (this.isMessageComponent()) return componentHandler.call(this, lang);

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.isAutocomplete()) return this.respond(await autocompleteGenerator.call(this, command, this.focused, this.client.i18n, locale));

  if (this.isCommand()) return commandExecutionWrapper.call(this, command, commandTypes.slash, lang);
};