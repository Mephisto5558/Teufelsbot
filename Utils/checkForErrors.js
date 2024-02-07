const
  { PermissionFlagsBits, Message, InteractionType, ChannelType, EmbedBuilder, Colors } = require('discord.js'),
  autocompleteGenerator = require('./autocompleteGenerator.js'),
  cooldowns = require('./cooldowns.js'),
  permissionTranslator = require('./permissionTranslator.js'),
  ownerOnlyFolders = require('./getOwnerOnlyFolders.js')(),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json');

/** 
 * @this {import('discord.js').BaseInteraction|Message}
 * @param {command<'both', boolean, true>}command
 * @param {lang}lang
 * @returns {Array|boolean}The error key for lang() or false if no error. true if error has been handled internally (But is an error).*/
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
  if (command.disabled) return replyOnDisabledCommand === false ? true : ['disabled', command.disabledReason || 'Not provided'];
  if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? true : ['nonBeta'];
  if (!command.dmPermission && this.channel.type == ChannelType.DM) return ['guildOnly'];

  const disabledList = this.guild?.db.commandSettings?.[command.aliasOf || command.name]?.disabled;
  if (disabledList) {
    if (disabledList.members?.includes(this.user.id)) return ['notAllowed.member'];
    if (disabledList.channels?.includes(this.channel.id)) return ['notAllowed.channel'];
    if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return ['notAllowed.role'];
  }

  if (command.category.toLowerCase() == 'nsfw' && !this.channel.nsfw) return ['nsfw'];

  const options = command.options?.flatMap(e => e?.options?.flatMap?.(e => e?.options || e) || e?.options || e) || [];
  for (let i = 0; i < options.length; i++) {
    const { autocomplete, strictAutocomplete, name } = options[i];

    if (
      autocomplete && strictAutocomplete && (this.options?.get(name) ?? this.args?.[i])
      && !(await autocompleteGenerator.call({ ...this, client: this.client, user: this.user, focused: { name, value: this.options?.get(name).value ?? this.args?.[i] } }, command, this.guild?.db.config?.lang ?? this.guild?.localeCode))
        .some(e => (e.toLowerCase?.() ?? e.value.toLowerCase()) === (this.options?.get(name).value ?? this.args?.[i])?.toLowerCase())
    ) return ['strictAutocompleteNoMatch'];
  }

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command.name, command.cooldowns);
    if (cooldown) return ['cooldown', cooldown];
  }

  if (this.guild && (this instanceof Message || this.type == InteractionType.ApplicationCommand)) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing([...(command.permissions?.user || []), PermissionFlagsBits.SendMessages]);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...(command.permissions?.client || []), PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('permissionDenied.embedTitle'),
        description: lang(`permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing, lang.__boundArgs__[0].locale, this.client.i18n).join('`, `') }),
        color: Colors.Red
      });

      if (botPermsMissing.includes('SendMessages') || botPermsMissing.includes('ViewChannel')) {
        if (this instanceof Message && this.guild.members.me.permissionsIn(this.channel).has(PermissionFlagsBits.AddReactions)) {
          await this.react('❌');
          this.react('✍️');
        }

        try { await this.user.send({ content: this.url, embeds: [embed] }); }
        catch (err) {
          if (err.code != 50007) throw err; // "Cannot send messages to this user"
        }
      }
      else await this.customReply({ embeds: [embed], ephemeral: true }, this instanceof Message ? 1e4 : 0);

      return true;
    }
  }

  return false;
};