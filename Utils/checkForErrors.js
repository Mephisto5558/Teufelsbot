const
  { PermissionFlagsBits, Message, ChannelType, EmbedBuilder, Colors, CommandInteraction } = require('discord.js'),
  autocompleteGenerator = require('./autocompleteGenerator.js'),
  cooldowns = require('./cooldowns.js'),
  permissionTranslator = require('./permissionTranslator.js'),
  DiscordAPIErrorCodes = require('./DiscordAPIErrorCodes.json');

/**
 * @this {import('discord.js').BaseInteraction|Message}
 * @param {command<'both', boolean, true>}command
 * @param {lang}lang
 * @returns {[string, Record<string, string>|string|undefined] | undefined}*/
function checkOptions(command, lang) {
  let option = command;
  if (this.options?._group) {
    option = option.options.find(e => e.name == this.options._group);
    if (!(option.dmPermission ?? command.dmPermission) && this.channel.type == ChannelType.DM) return ['guildOnly'];
  }
  if (this.options?._subcommand) {
    option = option.options.find(e => e.name == this.options._subcommand);
    if (!(option.dmPermission ?? command.dmPermission) && this.channel.type == ChannelType.DM) return ['guildOnly'];
  }

  if (!option.options) return;

  for (const [i, { required, name, description, descriptionLocalizations, autocomplete, strictAutocomplete }] of option.options.entries()) {
    if (required && !this.options?.get(name) && !this.args?.[i])
      return ['paramRequired', { option: name, description: descriptionLocalizations?.[lang.__boundArgs__[0].locale] ?? description }];

    if (
      autocomplete && strictAutocomplete && (this.options?.get(name) ?? this.args?.[i])
      && !autocompleteGenerator.call({
        ...this, client: this.client, guild: this.guild, user: this.user,
        focused: { name, value: this.options?.get(name).value ?? this.args?.[i] }
      }, command, this.guild?.db.config.lang ?? this.guild?.localeCode)
        .some(e => (e.toLowerCase?.() ?? e.value.toLowerCase()) === (this.options?.get(name).value ?? this.args?.[i])?.toLowerCase())
    ) return ['strictAutocompleteNoMatch', name];
  }
}

/**
 * @this {GuildInteraction|Message<true>}
 * @param {command<'both', boolean, true>}command
 * @param {lang}lang
 * @returns {boolean} `false` if no permission issues have been found.*/
async function checkPerms(command, lang) {
  const userPermsMissing = this.member.permissionsIn(this.channel).missing([...command.permissions?.user || [], PermissionFlagsBits.SendMessages]);
  const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...command.permissions?.client || [], PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]);

  if (!botPermsMissing.length && !userPermsMissing.length) return false;

  const embed = new EmbedBuilder({
    title: lang('permissionDenied.embedTitle'),
    description: lang(
      `permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`,
      { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `') }
    ),
    color: Colors.Red
  });

  if (botPermsMissing.includes('SendMessages') || botPermsMissing.includes('ViewChannel')) {
    if (this instanceof Message && this.guild.members.me.permissionsIn(this.channel).has(PermissionFlagsBits.AddReactions)) {
      await this.react('❌');
      this.react('✍️');
    }

    try { await this.user.send({ content: this.url, embeds: [embed] }); }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
    }
  }
  else await this.customReply({ embeds: [embed], ephemeral: true }, this instanceof Message ? 1e4 : 0);

  return true;
}

/**
 * @this {import('discord.js').BaseInteraction|Message}
 * @param {command<'both', boolean, true>}command
 * @param {lang}lang
 * @returns {[string, Record<string, string>|string|undefined]|boolean}
 * The error key and replacement values for `lang()` or `false` if no error. Returns `true` if error happend but has been handled internally.*/
module.exports = async function checkForErrors(command, lang) {
  if (!command) {
    if (this instanceof Message) {
      if (this.client.slashCommands.has(this.commandName)) return ['slashOnly', { name: this.commandName, id: this.client.slashCommands.get(this.commandName).id }];
      this.runMessages();
    }

    return true;
  }

  // DO NOT REMOVE THE FOLLOWING LINE
  if (this.client.config.ownerOnlyFolders.includes(command.category) && !this.client.config.devIds.has(this.user.id)) return true;
  if (this instanceof Message && this.guild?.members.me.communicationDisabledUntil) return true;
  if (command.disabled) return this.client.config.replyOnDisabledCommand ? ['disabled', command.disabledReason ?? 'Not provided'] : true;

  if (this.client.botType == 'dev' && !command.beta) return this.client.config.replyOnNonBetaCommand ? ['nonBeta'] : true;
  if (!command.dmPermission && this.channel.type == ChannelType.DM) return ['guildOnly'];

  const disabledList = this.guild?.db.config.commands?.[command.aliasOf ?? command.name]?.disabled;
  if (disabledList && this.member.id != this.guild.ownerId) {
    if (Object.values(disabledList).some(e => e.includes('*'))) return ['notAllowed.anyone'];
    if (disabledList.users?.includes(this.user.id)) return ['notAllowed.user'];
    if (disabledList.channels?.includes(this.channel.id)) return ['notAllowed.channel'];
    if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return ['notAllowed.role'];
  }

  if (command.category == 'nsfw' && !this.channel.nsfw) return ['nsfw'];

  if (command.options) {
    const err = checkOptions.call(this, command, lang);
    if (err) return err;
  }

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command.name, command.cooldowns);
    if (cooldown) return ['cooldown', cooldown];
  }

  return !!(this.inGuild() && (this instanceof Message || this instanceof CommandInteraction) && await checkPerms.call(this, command, lang));
};