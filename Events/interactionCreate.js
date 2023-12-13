const
  { EmbedBuilder, Colors, InteractionType } = require('discord.js'),
  { componentHandler, autocompleteGenerator, checkForErrors, commandExecutionWrapper } = require('../Utils');

/**@this import('discord.js').Interaction*/
module.exports = async function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const
    locale = this.guild?.db.config?.lang ?? this.guild?.localeCode,
    /**@type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale, backupPath: 'events.command' });

  if (this.type == InteractionType.MessageComponent) return componentHandler.call(this, lang);

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.type == InteractionType.ApplicationCommandAutocomplete) return this.respond(await autocompleteGenerator.call(this, command, locale));

  const errorKey = await checkForErrors.call(this, command, lang);
  if (errorKey === true) return;
  else if (errorKey) return this.customReply({ embeds: [new EmbedBuilder({ description: lang(...errorKey), color: Colors.Red })], ephemeral: true });

  if (this.type == InteractionType.ApplicationCommand) {
    if (!command.noDefer && !this.replied) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false });

    return commandExecutionWrapper.call(this, command, 'slash', lang);
  }
};