module.exports = {
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  /**@this WebServer*/
  type: function () { return this.formTypes.select([...this.client.i18n.availableLocales.keys()].map(k => ({ [this.client.i18n.__({ locale: k }, 'global.languageName')]: k }))); },
  position: 1
};
