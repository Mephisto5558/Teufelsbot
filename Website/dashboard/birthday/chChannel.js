const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'chChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  position: 2,

  type: types.channelsSelect(false, ['GUILD_TEXT'])
}