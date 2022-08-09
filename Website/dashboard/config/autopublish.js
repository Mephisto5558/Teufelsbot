const { formTypes } = require('discord-dashboard');

module.exports = {
  id: 'autopublish',
  name: 'Auto Publish',
  description: 'Automatically publish/crosspost every message a user writes in an announcement channel',
  position: 3,

  type: formTypes.switch()
}