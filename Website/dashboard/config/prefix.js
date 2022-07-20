const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'prefix',
  name: 'Prefix',
  description: "The bot's prefix",
  position: 2,
  type: types.input()
}