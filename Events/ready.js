const { ActivityType } = require('discord.js');

/**@this Client*/
module.exports = function ready() {
  this.user.setActivity(this.settings.activity || { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');
};