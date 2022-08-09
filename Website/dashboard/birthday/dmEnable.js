const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'dmEnable',
  name: 'Enable dm messages',
  description: 'DM the member on his/her birthday with a custom message',
  position: 4,

  type: formTypes.switch(),
}