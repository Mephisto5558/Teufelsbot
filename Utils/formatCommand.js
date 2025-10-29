/* eslint-disable sonarjs/cognitive-complexity, custom/cyclomatic-complexity,
   @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-argument -- will be fixed when commands are moved to their own lib */

/** @import { formatCommand } from '.' */

const
  { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, Message, PermissionsBitField } = require('discord.js'),
  { basename, dirname, resolve } = require('node:path'),
  { choiceValueMaxLength, choiceValueMinLength, choicesMaxAmt, descriptionMaxLength } = require('./constants');

/**
 * @param {string} path
 * @throws {Error} that is not `MODULE_NOT_FOUND` */
function getOptionalFile(path) {
  try { return require(path); }
  catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') throw err;
    return {};
  }
}

/** @type {formatCommand} */
module.exports = function formatCommand(option, path, id, i18n) {
  if ('options' in option) {
    // assume it is a dir and is in the top-level or one in (subcommand group)
    if (!path.endsWith('.js') && ('run' in option || option.type == ApplicationCommandOptionType[ApplicationCommandOptionType.SubcommandGroup]))
      option.options = option.options.map(e => ({ ...e, options: [...e.options ?? [], ...getOptionalFile(resolve(path, e.name)).options ?? []] }));
    option.options = option.options.map(e => formatCommand(e, path, `${id}.options.${e.name}`, i18n));
  }

  if ('run' in option) option.name ??= id.split('.').at(-1);
  if (/[A-Z]/.test(option.name)) {
    if (!option.disabled) log.error(`${option.name} (${id}) has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  option.description ??= i18n.__({ errorNotFound: true }, `${id}.description`);
  if ('choices' in option) {
    option.choices = option.choices.map(e => (
      typeof e == 'object'
        ? { ...e, __SCHandlerCustom: true }
        : { name: i18n.__({ undefinedNotFound: true }, `${id}.choices.${e}`) ?? e, value: e }
    ));
  }
  if ('autocompleteOptions' in option) option.autocomplete = true;

  if (option.description.length > descriptionMaxLength) {
    if (!option.disabled) log.warn(`Description of option "${option.name}" (${id}.description) is too long (max length is 100)! Slicing.`);
    option.description = option.description.slice(0, descriptionMaxLength);
  }

  for (const [locale] of [...i18n.availableLocales].filter(([e]) => e != i18n.config.defaultLocale)) {
    option.descriptionLocalizations ??= {};
    const localizedDescription = i18n.__({ locale, undefinedNotFound: true }, `${id}.description`);
    if (localizedDescription?.length > descriptionMaxLength && !option.disabled)
      log.warn(`"${locale}" description localization of option "${option.name}" (${id}.description) is too long (max length is 100)! Slicing.`);

    if (localizedDescription) option.descriptionLocalizations[locale] = localizedDescription.slice(0, descriptionMaxLength);
    else if (!option.disabled) log.warn(`Missing "${locale}" description localization for option "${option.name}" (${id}.description)`);

    if ('choices' in option) {
      if (option.choices.length > choicesMaxAmt)
        throw new Error(`Too many choices (${option.choices.length}) found for option "${option.name}"). Max is ${choicesMaxAmt}.`);

      let /** @type {NonNullable<commandOptions<true>['choices']>[number]} */ choice;
      for (choice of option.choices) {
        if ('__SCHandlerCustom' in choice) {
          delete choice.__SCHandlerCustom; /* eslint-disable-line no-underscore-dangle */
          continue;
        }

        choice.nameLocalizations ??= {};

        const localizedChoice = i18n.__({ locale, undefinedNotFound: true }, `${id}.choices.${choice.value}`);
        if (!option.disabled && localizedChoice && !localizedChoice.length.inRange(1, choiceValueMaxLength + 1)) {
          log.warn(
            `"${locale}" choice name localization for "${choice.value}" of option "${option.name}" (${id}.choices.${choice.value}) is too `
            + (
              localizedChoice.length < choiceValueMinLength
                ? 'short (min length is 2)! Using undefined.'
                : `long (max length is ${choiceValueMaxLength})! Slicing.`
            )
          );
        }

        if (localizedChoice && localizedChoice.length > choiceValueMinLength)
          choice.nameLocalizations[locale] = localizedChoice.slice(0, choiceValueMaxLength);
        else if (choice.name != choice.value && !option.disabled)
          log.warn(`Missing "${locale}" choice name localization for "${choice.value}" in option "${option.name}" (${id}.choices.${choice.value})`);
      }
    }
  }

  if ('run' in option) {
    if (!path.endsWith('.js')) { // assume it is a dir
      option.filePath ??= resolve(path, 'index.js');

      const originalRun = option.run;
      option.run = async function runWrapper(lang, ...args) {
        const additionalParams = await originalRun?.call(this, lang, ...args);
        if (additionalParams === false || additionalParams instanceof Message) return;

        const subcommand = this.options?.getSubcommandGroup(false) ?? this.options?.getSubcommand(true) ?? this.args[0];

        lang.config.backupPaths.push(`${lang.config.backupPaths[0]}.${subcommand.replaceAll(/_./g, e => e[1].toUpperCase())}`);

        /** @type {command} */
        const subCommandFile = require(resolve(path, `${subcommand}.js`));
        return subCommandFile.run.call(this, lang, additionalParams, ...args);
      };
    }
    else if (!option.disabled && !['function', 'async function', 'async run(', 'run('].some(e => String(option.run).startsWith(e)))
      throw new Error(`The run property of file "${id}" is not a function (Got "${typeof option.run}"). You cannot use arrow functions.`);

    option.filePath ??= resolve(path);
    option.category ??= basename(dirname(path)).toLowerCase();

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!(option.type in ApplicationCommandOptionType)) {
      /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- check */
      if (!option.disabled) throw new Error(`Invalid option.type, got "${option.type}" (${id})`);
    }
    else if (!Number.parseInt(option.type) && option.type != 0) option.type = ApplicationCommandType[option.type];

    if (option.permissions?.user?.length) option.defaultMemberPermissions = new PermissionsBitField(option.permissions.user);
    option.dmPermission ??= false;

    return option;
  }

  if ('channelTypes' in option) {
    option.channelTypes = option.channelTypes.map(e => {
      if (!(e in ChannelType)) throw new Error(`Invalid option.channelType, got ${JSON.stringify(e)} (${id})`);
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- false positive, we guard against `e` not being in `ChannelType`. */
      return Number.isNaN(Number.parseInt(e)) ? ChannelType[e] : Number.parseInt(e);
    });
  }

  if (!(option.type in ApplicationCommandOptionType)) throw new Error(`Missing or invalid option.type, got "${option.type}" (${id})`);
  if (!Number.parseInt(option.type) && option.type != 0) option.type = ApplicationCommandOptionType[option.type];

  if (
    [ApplicationCommandOptionType.Number, ApplicationCommandOptionType.Integer].includes(option.type)
    && ('minLength' in option || 'maxLength' in option)
  ) throw new Error(`Number and Integer options do not support "minLength" and "maxLength" (${id})`);
  if (option.type == ApplicationCommandOptionType.String && ('minValue' in option || 'maxValue' in option))
    throw new Error(`String options do not support "minValue" and "maxValue" (${id})`);

  return option;
};