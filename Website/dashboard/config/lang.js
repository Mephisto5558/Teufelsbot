const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  position: 1,
  type: types.select({ 'English': 'en', 'German': 'de' })
}