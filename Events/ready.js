const { ActivityType } = require('discord.js');

module.exports = async client => {
  client.user.setActivity(await client.db.get('activity') || { name: '/help', type: ActivityType.Playing });

  client.log('Ready to receive prefix commands');
}