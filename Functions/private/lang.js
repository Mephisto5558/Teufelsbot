module.exports = ({ db, lang }, { id, preferredLocale }, command) => {
  const locale = db.get('guildSettings')[id]?.config?.lang || preferredLocale.slice(0, 2);

  return function language(phrase, ...replacements) {
    if (phrase.split('.')[0] in lang.getCatalog()[lang.getLocale()]) return lang.__({ phrase, locale, ...replacements });
    else return lang.__({ phrase: `commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${phrase}`, locale }, ...replacements);
  }
}