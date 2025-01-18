const
  { EmbedBuilder, Colors } = require('discord.js'),
  { constants: { autocompleteOptionsMaxAmt } } = require('#Utils');

/** @type {import('.')} */
module.exports = {
  options: [{
    name: 'language',
    type: 'String',
    required: true,
    autocompleteOptions() {
      return [...this.client.i18n.availableLocales.keys()].reduce((acc, locale) => {
        if (acc.length > autocompleteOptionsMaxAmt) return acc;

        const name = this.client.i18n.__({ locale, undefinedNotFound: true }, 'global.languageName') ?? locale;
        if (name.toLowerCase().includes(this.focused.value.toLowerCase()) || locale.toLowerCase().includes(this.focused.value.toLowerCase()))
          acc.push({ name, value: locale });

        return acc;
      }, []);
    },
    strictAutocomplete: true
  }],

  async run() {
    const
      language = this.options.getString('language', true),

      /** @type {lang} */
      newLang = this.client.i18n.__.bind(this.client.i18n, { locale: this.client.i18n.availableLocales.has(language) ? language : this.client.i18n.config.defaultLocale });

    /** @type {command<'slash', true, true>} */
    let { aliasOf, name, category } = this.client.slashCommands.get(this.commandName);
    if (aliasOf) ({ name, category } = this.client.slashCommands.get(aliasOf));

    const embed = new EmbedBuilder({
      title: newLang(`commands.${category.toLowerCase()}.${name}.language.embedTitle`),
      description: newLang(`commands.${category.toLowerCase()}.${name}.language.embedDescription`, newLang('global.languageName')),
      color: Colors.Green
    });

    await this.guild.updateDB('config.lang', language);
    return this.editReply({ embeds: [embed] });
  }
};