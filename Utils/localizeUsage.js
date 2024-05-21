/**
 * @param {command<'slash', boolean, true>} command
 * @param {string}path
 * @param {import('@mephisto5558/i18n')}i18n
 *
 * Mutates `command`.*/
module.exports = function localizeUsage(command, path, i18n) {
  command.usage ??= {};
  command.usageLocalizations ??= {};

  for (const [locale] of i18n.availableLocales) {
    const localizedUsage = {
      usage: command.usage?.usage ?? i18n.__({ locale, undefinedNotFound: true }, `${path}.usage.usage`),
      examples: command.usage?.examples ?? i18n.__({ locale, undefinedNotFound: true }, `${path}.usage.examples`)
    };

    localizedUsage.usage &&= `{prefix}{cmdName} ${localizedUsage.usage}`.replaceAll('{cmdName}', command.name);
    localizedUsage.examples &&= `{prefix}{cmdName} ${localizedUsage.examples}`.replaceAll('{cmdName}', command.name);

    if (locale == i18n.config.defaultLocale) command.usage = localizedUsage;
    else command.usageLocalizations[locale] = localizedUsage;
  }

  return command;
};