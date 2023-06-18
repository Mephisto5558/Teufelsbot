const { ActivityType } = require('discord.js');

module.exports = function ready() {
  this.user.setActivity(this.settings.activity || { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');
};