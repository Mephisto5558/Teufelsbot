const { ActivityType } = require('discord.js');

module.exports = async client => {
  client.user.setActivity(client.db.get('botSettings').activity || { name: '/help', type: ActivityType.Playing });

  client.log('Ready to receive prefix commands');
}