const
  { PermissionFlagsBits, Message, ChannelType, EmbedBuilder, Colors, CommandInteraction } = require('discord.js'),
  autocompleteGenerator = require('./autocompleteGenerator.js'),
  cooldowns = require('./cooldowns.js'),
  permissionTranslator = require('./permissionTranslator.js'),
  ownerOnlyFolders = require('./getOwnerOnlyFolders.js')(),
  DiscordAPIErrorCodes = require('./DiscordAPIErrorCodes.json'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json');

/**
 * @this {import('discord.js').BaseInteraction|Message}
 * @param {command<'both', boolean, true>}command
 * @param {lang}lang
 * @returns {[string, Record<string, string>]|boolean}The error key and replacement values for `lang()` or `false` if no error. Returns `true` if error happend but has been handled internally.*/
module.exports = async function checkForErrors(command, lang) {
  if (!command) {
    if (this instanceof Message) {
      if (this.client.slashCommands.has(this.commandName)) return ['slashOnly', { name: this.commandName, id: this.client.slashCommands.get(this.commandName).id }];
      this.runMessages();
    }

    return true;
  }

  // DO NOT REMOVE THE FOLLOWING LINE
  if (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id) return true;
  if (this instanceof Message && this.guild?.members.me.communicationDisabledUntil) return true;
  if (command.disabled) return replyOnDisabledCommand === false ? true : ['disabled', command.disabledReason ?? 'Not provided'];
  if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? true : ['nonBeta'];
  if (!command.dmPermission && this.channel.type == ChannelType.DM) return ['guildOnly'];

  const disabledList = this.guild?.db.commandSettings?.[command.aliasOf ?? command.name]?.disabled;
  if (disabledList) {
    if (disabledList.members?.includes(this.user.id)) return ['notAllowed.member'];
    if (disabledList.channels?.includes(this.channel.id)) return ['notAllowed.channel'];
    if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return ['notAllowed.role'];
  }

  if (command.category.toLowerCase() == 'nsfw' && !this.channel.nsfw) return ['nsfw'];

  if (command.options) {
    let [...options] = command.options;
    if (this.options?._group) ({ options } = options.find(e => e.name == this.options._group));
    if (this.options?._subcommand) ({ options } = options.find(e => e.name == this.options._subcommand));

    for (const [i, { required, name, description, descriptionLocalizations, autocomplete, strictAutocomplete }] of options.entries()) {
      if (required && !this.options?.get(name) && !this.args?.[i])
        return ['paramRequired', { option: name, description: descriptionLocalizations[lang.__boundArgs__[0].locale] ?? description }];

      if (
        autocomplete && strictAutocomplete && (this.options?.get(name) ?? this.args?.[i])
        && !autocompleteGenerator.call({
          ...this, client: this.client, user: this.user,
          focused: { name, value: this.options?.get(name).value ?? this.args?.[i] }
        }, command, this.guild?.db.config?.lang ?? this.guild?.localeCode)
          .some(e => (e.toLowerCase?.() ?? e.value.toLowerCase()) === (this.options?.get(name).value ?? this.args?.[i])?.toLowerCase())
      ) return ['strictAutocompleteNoMatch', name];
    }
  }

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command.name, command.cooldowns);
    if (cooldown) return ['cooldown', cooldown];
  }

  if (this.guild && (this instanceof Message || this instanceof CommandInteraction)) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing([...command.permissions?.user || [], PermissionFlagsBits.SendMessages]);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...command.permissions?.client || [], PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('permissionDenied.embedTitle'),
        description: lang(
          `permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`,
          { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `') }
        ),
        color: Colors.Red
      });

      if (botPermsMissing.includes(PermissionFlagsBits.SendMessages) || botPermsMissing.includes(PermissionFlagsBits.ViewChannel)) {
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
  }

  return false;
};