const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'prefix',
  name: 'Prefix',
  description: "The bot's prefix",
  position: 2,

  type: formTypes.input()
}