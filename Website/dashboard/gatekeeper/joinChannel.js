const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  position: 1,

  type: types.channelsSelect(false, ['GUILD_TEXT'])
}