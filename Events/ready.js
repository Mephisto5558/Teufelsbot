const { ActivityType } = require('discord.js');

/**@this import('discord.js').Client*/
module.exports = function ready() {
  this.user.setActivity(this.settings.activity || { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');
};