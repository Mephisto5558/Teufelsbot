module.exports = async (client, { guild }, command) => {
  let guildLang = client.db.get('guildSettings')[guild.id]?.config?.lang || guild.preferredLocale.slice(0, 2);
  if (!client.lang.locales.includes(guildLang)) guildLang = client.lang.default_locale;
  const langData = client.lang.getLocale(guildLang);

  return function lang(message, ...args) {
    let data;
    if (Object.keys(client.lang.messages[client.lang.default_locale]).includes(message.split('.')[0])) data = langData(message);
    else data = langData(`commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);

    if (data !== undefined) return data;

    if (Object.keys(client.lang.messages[client.lang.default_locale]).includes(message.split('.')[0])) data = client.defaultLangData(message);
    else data = client.defaultLangData(`commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);

    return data || `NO_TEXT_FOUND: ${message}`;
  }
}