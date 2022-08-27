const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'prefixPrefix',
  name: 'Prefix',
  description: "The bot's prefix",
  position: 2,

  type: formTypes.input()
}