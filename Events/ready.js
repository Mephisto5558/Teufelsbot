const { ActivityType } = require('discord.js');

module.exports = function ready() {
  this.user.setActivity(this.db.get('botSettings').activity || { name: '/help', type: ActivityType.Playing });
  this.log('Ready to receive prefix commands');
}