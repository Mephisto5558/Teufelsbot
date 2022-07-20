const types = require('discord-dashboard').formTypes;

module.exports = {
  id: 'autopublish',
  name: 'Auto Publish',
  description: 'Automatically publish/crosspost every message a user writes in an announcement channel',
  position: 3,

  type: types.switch()
}