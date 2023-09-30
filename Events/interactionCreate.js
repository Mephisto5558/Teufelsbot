const
  { EmbedBuilder, Colors, InteractionType, ApplicationCommandOptionType } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, componentHandler, getOwnerOnlyFolders, autocompleteGenerator } = require('../Utils'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  errorEmbed = new EmbedBuilder({ color: Colors.Red });

/**@this {import('discord.js').CommandInteraction}*/
module.exports = async function interactionCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  const locale = this.guild.db.config?.lang ?? this.guild.localeCode;
  if (this.type == InteractionType.MessageComponent) return componentHandler.call(this, I18nProvider.__.bBind(I18nProvider, { locale, backupPath: 'events.command' }));

  const command = this.client.slashCommands.get(this.commandName);
  if (command && this.type == InteractionType.ApplicationCommandAutocomplete) return this.respond(await autocompleteGenerator.call(this, command, locale));

  const lang = I18nProvider.__.bBind(I18nProvider, { locale, backupPath: 'events.command' });

  //DO NOT REMOVE THIS STATEMENT!
  if (!command || (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id)) return;
  if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? void 0 : this.reply({ embeds: [errorEmbed.setDescription(lang('nonBeta'))], ephemeral: true });
  if (command.disabled) return replyOnDisabledCommand === false ? void 0 : this.reply({ embeds: [errorEmbed.setDescription(lang('disabled', command.disabledReason || 'Not provided'))], ephemeral: true });

  const disabledList = this.guild.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};
  if (disabledList.members?.includes(this.user.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('notAllowed.member'))], ephemeral: true });
  if (disabledList.channels?.includes(this.channel.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('notAllowed.channel'))], ephemeral: true });
  if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return this.reply({ embeds: [errorEmbed.setDescription(lang('notAllowed.role'))], ephemeral: true });
  if (command.category.toLowerCase() == 'nsfw' && !this.channel.nsfw) return this.reply({ embeds: [errorEmbed.setDescription(lang('nsfw'))], ephemeral: true });

  for (const { autocomplete, strictAutocomplete, name } of command.options?.flatMap(e => e?.options?.flatMap?.(e => e?.options || e) || e?.options || e) || []) {

    if (
      autocomplete && strictAutocomplete && this.options.get(name) && !(await autocompleteGenerator.call(Object.assign({}, this, { client: this.client, focused: { name, value: this.options.get(name).value } }), command, locale))
        .some(e => (e.toLowerCase?.() || e.value.toLowerCase()).includes(this.options.get(name).value.toLowerCase()))
    ) return this.reply({ embeds: [errorEmbed.setDescription(lang('strictAutocompleteNoMatch'))], ephemeral: true });
  }

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command);
    if (cooldown) return this.reply({ embeds: [errorEmbed.setDescription(lang('cooldown', cooldown))], ephemeral: true });
  }

  if (this.type == InteractionType.ApplicationCommand) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing(command.permissions?.user);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing(command.permissions?.client);

    if (botPermsMissing.length || userPermsMissing.length) {
      errorEmbed.data.title = lang('permissionDenied.embedTitle');
      errorEmbed.data.description = lang(`permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') });

      return this.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!command.noDefer && !this.replied) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false });

    for (const entry of this.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replaceAll('<@!', '<@');

    const cmdLang = I18nProvider.__.bBind(I18nProvider, { locale, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.aliasOf ?? command.name}` : null });
    try {
      command.run.call(this, cmdLang)?.catch(err => errorHandler.call(this.client, err, this, lang));
      if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
    } catch (err) { errorHandler.call(this.client, err, this, lang); }
  }
};
