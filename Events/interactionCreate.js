/** @import { ClientEvents } from 'discord.js' */

const { componentHandler } = require('#Utils');

/** @this {ClientEvents['interactionCreate'][0]} */
module.exports = async function interactionCreate() {
  if (
    this.client.settings.blacklist?.includes(this.user.id)
    || !(this.isCommand() || this.isAutocomplete() || this.isMessageComponent())
  ) return;

  const locale = (this.inGuild() ? this.guild : this.user).localeCode;

  if (this.isMessageComponent()) return componentHandler.call(this, this.client.i18n.getTranslator({ locale }));

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.isAutocomplete()) {
    const option = command.findOption(this.focused, this);
    if (!option) throw new Error('A command option is known to discord but not to the local data. This should never happen.');

    return this.respond(await option.generateAutocomplete(this, this.focused.value, locale));
  }

  if (this.isCommand()) return command.runWrapper(this, this.client.i18n, locale);
};