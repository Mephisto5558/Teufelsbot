/* eslint-disable @typescript-eslint/no-deprecated -- will be fixed when commands are moved to their own lib*/
const
  { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js'),
  /* eslint-disable-next-line @typescript-eslint/unbound-method -- not an issue with `node:path`*/
  { resolve, dirname, basename } = require('node:path'),
  { choicesMaxAmt, choiceValueMaxLength } = require('./constants');

/** @type {import('.').formatCommand}*/
module.exports = function formatCommand(option, path, id, i18n) {
  if ('options' in option) option.options = option.options.map(e => formatCommand(e, path, `${id}.options.${e.name}`, i18n));

  if ('run' in option) option.name ??= id.split('.').last();
  if (/[A-Z]/.test(option.name)) {
    if (!option.disabled) log.error(`${option.name} (${id}) has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  option.description ??= i18n.__({ errorNotFound: true }, `${id}.description`);
  if ('choices' in option)
    option.choices = option.choices.map(e => typeof e == 'object' ? { ...e, __SCHandlerCustom: true } : { name: i18n.__({ undefinedNotFound: true }, `${id}.choices.${e}`) ?? e, value: e });
  if ('autocompleteOptions' in option) option.autocomplete = true;

  if (option.description.length > 100) {
    if (!option.disabled) log.warn(`Description of option "${option.name}" (${id}.description) is too long (max length is 100)! Slicing.`);
    option.description = option.description.slice(0, 100);
  }

  for (const [locale] of [...i18n.availableLocales].filter(([e]) => e != i18n.config.defaultLocale)) {
    option.descriptionLocalizations ??= {};
    const localizedDescription = i18n.__({ locale, undefinedNotFound: true }, `${id}.description`);
    if (localizedDescription?.length > 100 && !option.disabled)
      log.warn(`"${locale}" description localization of option "${option.name}" (${id}.description) is too long (max length is 100)! Slicing.`);

    if (localizedDescription) option.descriptionLocalizations[locale] = localizedDescription.slice(0, 100);
    else if (!option.disabled) log.warn(`Missing "${locale}" description localization for option "${option.name}" (${id}.description)`);

    if ('choices' in option) {
      if (option.choices.length > choicesMaxAmt) throw new Error(`Too many choices (${option.choices.length}) found for option "${option.name}"). Max is ${choicesMaxAmt}.`);

      option.choices.map(e => {
        if (e.__SCHandlerCustom) {
          delete e.__SCHandlerCustom;
          return e;
        }

        e.nameLocalizations ??= {};

        const localizedChoice = i18n.__({ locale, undefinedNotFound: true }, `${id}.choices.${e.value}`);
        if (!option.disabled && localizedChoice && !localizedChoice.length.inRange(1, choiceValueMaxLength + 1)) {
          log.warn(
            `"${locale}" choice name localization for "${e.value}" of option "${option.name}" (${id}.choices.${e.value}) is too `
            + (localizedChoice.length < 2 ? 'short (min length is 2)! Using undefined.' : `long (max length is ${choiceValueMaxLength})! Slicing.`)
          );
        }

        if (localizedChoice && localizedChoice.length > 2) e.nameLocalizations[locale] = localizedChoice.slice(0, choiceValueMaxLength + 1);
        else if (e.name != e.value && !option.disabled) log.warn(`Missing "${locale}" choice name localization for "${e.value}" in option "${option.name}" (${id}.choices.${e.value})`);

        return e;
      });
    }
  }

  if ('run' in option) {
    /* eslint-disable-next-line @typescript-eslint/unbound-method -- not getting called here*/
    if (!option.disabled && !['function', 'async function', 'async run(', 'run('].some(e => String(option.run).startsWith(e)))
      throw new Error(`The run property of file "${id}" is not a function (Got "${typeof option.run}"). You cannot use arrow functions.`);

    option.filePath ??= resolve(path);
    option.category ??= basename(dirname(path)).toLowerCase();

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!(option.type in ApplicationCommandOptionType)) { if (!option.disabled) throw new Error(`Invalid option.type, got "${option.type}" (${id})`); }
    else if (!Number.parseInt(option.type) && option.type != 0) option.type = ApplicationCommandType[option.type];

    if (option.permissions?.user?.length > 0) option.defaultMemberPermissions = new PermissionsBitField(option.permissions.user);
    option.dmPermission ??= false;

    return option;
  }

  if ('channelTypes' in option) {
    option.channelTypes = option.channelTypes.map(e => {
      if (!(e in ChannelType)) throw new Error(`Invalid option.channelType, got ${JSON.stringify(e)} (${id})`);
      return Number.isNaN(Number.parseInt(e)) ? ChannelType[e] : Number.parseInt(e);
    });
  }

  if (!(option.type in ApplicationCommandOptionType)) throw new Error(`Missing or invalid option.type, got "${option.type}" (${id})`);
  if (!Number.parseInt(option.type) && option.type != 0) option.type = ApplicationCommandOptionType[option.type];

  if ([ApplicationCommandOptionType.Number, ApplicationCommandOptionType.Integer].includes(option.type) && ('minLength' in option || 'maxLength' in option))
    throw new Error(`Number and Integer options do not support "minLength" and "maxLength" (${id})`);
  if (option.type == ApplicationCommandOptionType.String && ('minValue' in option || 'maxValue' in option))
    throw new Error(`String options do not support "minValue" and "maxValue" (${id})`);

  return option;
};