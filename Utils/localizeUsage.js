/** @type {import('.').localizeUsage}*/
module.exports = function localizeUsage(command, path, i18n) {
  const usageLocalizations = {};
  let usage;

  for (const [locale] of i18n.availableLocales) {
    const localizedUsage = {
      usage: command.usage?.usage ?? i18n.__({ locale, undefinedNotFound: true }, `${path}.usage.usage`),
      examples: command.usage?.examples ?? i18n.__({ locale, undefinedNotFound: true }, `${path}.usage.examples`)
    };

    /* eslint-disable @typescript-eslint/no-deprecated -- will be fixed when the code is exported to the new lib.*/
    localizedUsage.usage &&= `{prefix}{cmdName} ${localizedUsage.usage}`.replaceAll('{cmdName}', command.name);
    localizedUsage.examples &&= `{prefix}{cmdName} ${localizedUsage.examples}`.replaceAll('{cmdName}', command.name);
    /* eslint-enable @typescript-eslint/no-deprecated */

    if (locale == i18n.config.defaultLocale) usage = localizedUsage;
    else usageLocalizations[locale] = localizedUsage;
  }

  return [usage, usageLocalizations];
};