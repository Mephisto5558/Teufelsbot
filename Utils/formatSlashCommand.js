const { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js');

/**
 * @param {command<'slash', boolean, true> | commandOptions<true>}option
 * @param {string}path
 * @param {import('@mephisto5558/i18n')}i18n
 * @throws {Error} on not autofixable invalid data*/
module.exports = function format(option, path, i18n) {
  if ('options' in option) option.options = option.options.map(e => format(e, `${path}.options.${e.name}`, i18n));

  if (/[A-Z]/.test(option.name)) {
    if (!option.disabled) log.error(`${option.name} (${path}) has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  option.description ??= i18n.__({ errorNotFound: true }, `${path}.description`);
  if ('choices' in option)
    option.choices = option.choices.map(e => typeof e == 'object' ? e.fMerge({ __SCHandlerCustom: true }) : { name: i18n.__({ undefinedNotFound: true }, `${path}.choices.${e}`) ?? e, value: e });
  if ('autocompleteOptions' in option) option.autocomplete = true;

  if (option.description.length > 100) {
    if (!option.disabled) log.warn(`Description of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);
    option.description = option.description.substring(0, 100);
  }

  for (const [locale] of [...i18n.availableLocales].filter(([e]) => e != i18n.config.defaultLocale)) {
    option.descriptionLocalizations ??= {};
    let localeText = i18n.__({ locale, undefinedNotFound: true }, `${path}.description`);
    if (localeText?.length > 100 && !option.disabled) log.warn(`"${locale}" description localization of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);

    if (localeText) option.descriptionLocalizations[locale] = localeText?.slice(0, 100);
    else if (!option.disabled) log.warn(`Missing "${locale}" description localization for option "${option.name}" (${path}.description)`);

    if ('choices' in option) option.choices.map(e => {
      if (e.__SCHandlerCustom) {
        delete e.__SCHandlerCustom;
        return e;
      }

      e.nameLocalizations ??= {};
      const localeText = i18n.__({ locale, undefinedNotFound: true }, `${path}.choices.${e.value}`);
      if (!option.disabled && (localeText?.length < 2 || localeText?.length > 32))
        log.warn(
          `"${locale}" choice name localization for "${e.value}" of option "${option.name}" (${path}.choices.${e.value}) is too`
          + (localeText?.length < 2 ? 'short (min length is 2)! Using undefined.' : 'long (max length is 32)! Slicing.')
        );

      if (localeText && localeText.length > 2) e.nameLocalizations[locale] = localeText.slice(0, 32);
      else if (e.name != e.value && !option.disabled) log.warn(`Missing "${locale}" choice name localization for "${e.value}" in option "${option.name}" (${path}.choices.${e.value})`);

      return e;
    });
  }

  if ('run' in option) {
    if (!option.disabled && !String(option.run).startsWith('function') && !String(option.run).startsWith('async function'))
      throw new Error(`The run property of file "${path}" is not a function (Got "${typeof option.run}"). You cannot use arrow functions.`);

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!ApplicationCommandType[option.type]) { if (!option.disabled) throw new Error(`Invalid option.type, got "${option.type}" (${path})`); }
    else if (isNaN(option.type)) option.type = ApplicationCommandType[option.type];

    if (option.permissions?.user?.length) option.defaultMemberPermissions = new PermissionsBitField(option.permissions.user);
    option.dmPermission ??= false;

    return option;
  }

  if ('channelTypes' in option) option.channelTypes = option.channelTypes.map(e => {
    if (!(e in ChannelType)) throw Error(`Invalid option.channelType, got "${e}" (${path})`);
    return isNaN(e) ? ChannelType[e] : e;
  });

  if (!option.type || !ApplicationCommandOptionType[option.type]) throw Error(`Missing or invalid option.type, got "${option.type}" (${path})`);
  if (isNaN(option.type)) option.type = ApplicationCommandOptionType[option.type];

  if ([ApplicationCommandOptionType.Number, ApplicationCommandOptionType.Integer].includes(option.type) && ('minLength' in option || 'maxLength' in option))
    throw new Error(`Number and Integer options do not support "minLength" and "maxLength" (${path})`);
  if (option.type == ApplicationCommandOptionType.String && ('minValue' in option || 'maxValue' in option))
    throw new Error(`String options do not support "minValue" and "maxValue" (${path})`);

  return option;
};