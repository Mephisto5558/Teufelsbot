const
  { EmbedBuilder, Colors, InteractionType, ApplicationCommandOptionType, ComponentType } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, buttonPressHandler, getOwnerOnlyFolders } = require('../Utils'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  errorEmbed = new EmbedBuilder({ color: Colors.Red });

async function componentHandler(lang) {
  switch (this.componentType) {
    case ComponentType.Button: return buttonPressHandler.call(this, lang);
  }
}

async function autocompleteGenerator(command, locale) {
  const response = v => ({ name: I18nProvider.__({ locale, undefinedNotFound: true }, `commands.${command.category.toLowerCase()}.${command.name}.options.${this.options._group ? this.options._group + '.' : ''}${this.options._subcommand ? this.options._subcommand + '.' : ''}${this.focused.name}.choices.${v}`) ?? v, value: v });

  let { options } = command.fMerge();
  if (this.options._group) options = options.find(e => e.name == this.options._group);
  if (this.options._subcommand) options = options.find(e => e.name == this.options._subcommand).options;
  options = options.find(e => e.name == this.focused.name).autocompleteOptions;
  if (typeof options == 'function') options = await options.call(this);

  if (options.constructor.name == 'Object') return [options];
  return typeof options == 'string' ? [response(options)] : options
    .filter(e => !this.focused.value || (e.toLowerCase?.() || e.value.toLowerCase()).includes(this.focused.value.toLowerCase()))
    .slice(0, 25).map(e => typeof e == 'object' ? e : response(e));
}

/**@this {import('discord.js').CommandInteraction}*/
module.exports = async function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const locale = this.guild.db.config?.lang ?? this.guild.localeCode;
  if (this.type == InteractionType.MessageComponent) return componentHandler.call(this, I18nProvider.__.bBind(I18nProvider, { locale }));

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.type == InteractionType.ApplicationCommandAutocomplete) return this.respond(await autocompleteGenerator.call(this, command, locale));

  const lang = I18nProvider.__.bBind(I18nProvider, { locale, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.name}` : null });

  //DO NOT REMOVE THIS STATEMENT!
  if (!command || (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id)) return;
  if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? void 0 : this.reply({ embeds: [errorEmbed.setDescription(lang('events.commandNonBeta'))], ephemeral: true });
  if (command.disabled) return replyOnDisabledCommand === false ? void 0 : this.reply({ embeds: [errorEmbed.setDescription(lang('events.commandDisabled'))], ephemeral: true });

  const disabledList = this.guild.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};
  if (disabledList.members && disabledList.members.includes(this.user.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.member'))], ephemeral: true });
  if (disabledList.channels && disabledList.channels.includes(this.channel.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.channel'))], ephemeral: true });
  if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.role'))], ephemeral: true });

  for (const { autocomplete, strictAutocomplete, name } of command.options?.flatMap(e => e?.options?.flatMap?.(e => e?.options || e) || e?.options || e) || []) {

    if (
      autocomplete && strictAutocomplete && this.options.get(name) && !(await autocompleteGenerator.call(Object.assign({}, this, { client: this.client, focused: { name, value: this.options.get(name).value } }), command, locale))
        .filter(e => (e.toLowerCase?.() || e.value.toLowerCase()).includes(this.options.get(name).value.toLowerCase())).length
    ) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.strictAutocompleteNoMatch'))], ephemeral: true });
  }

  if (command.requireEconomy && (!this.guild.db.economy?.enable || !this.guild.db.economy?.[this.user.id]?.gaining?.chat))
    return this.reply({ embeds: [errorEmbed.setDescription(lang(this.guild.db.economy.enable ? 'events.economyNotInitialized' : 'events.economyDisabled'))], ephemeral: true });

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command);
    if (cooldown) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.cooldown', cooldown))], ephemeral: true });
  }

  if (this.type == InteractionType.ApplicationCommand) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing(command.permissions?.user);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing(command.permissions?.client);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: lang(`events.permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
      });

      return this.reply({ embeds: [embed], ephemeral: true });
    }

    if (!command.noDefer && !this.replied) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false });

    for (const entry of this.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replaceAll('<@!', '<@');

    try {
      command.run.call(this, lang)?.catch(err => errorHandler.call(this.client, err, this, lang));
      if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
    } catch (err) { errorHandler.call(this.client, err, this, lang); }
  }
};