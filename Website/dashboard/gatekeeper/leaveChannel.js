const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  position: 3,

  type: types.channelsSelect(false, ['GUILD_TEXT'])
}