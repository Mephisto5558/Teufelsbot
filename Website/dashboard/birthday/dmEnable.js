const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'dmEnable',
  name: 'Enable dm messages',
  description: 'DM the member on his/her birthday with a custom message',
  position: 4,

  type: types.switch(),
}