module.exports = {
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  /**@this WebServer*/
  type: function () { return this.formTypes.select({ English: 'en', German: 'de' }); },
  position: 1
};