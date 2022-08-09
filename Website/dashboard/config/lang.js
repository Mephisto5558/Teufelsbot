const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  position: 1,
  
  type: formTypes.select({ 'English': 'en', 'German': 'de' })
}