/** @import { dashboardSetting } from '#types/locals' */

/** @type {dashboardSetting} */
module.exports = {
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  type() {
    return this.formTypes.select(Object.fromEntries([...this.client.i18n.availableLocales.keys()].map(locale => [
      this.client.i18n.__({ locale }, 'global.languageName'), locale
    ])));
  },
  position: 1
};