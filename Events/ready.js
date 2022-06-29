module.exports = async client => {
  const activity = await client.db.get('activity');

  client.user.setActivity(
    activity || { name: 'Coding is fun! | /help', type: 'PLAYING' }
  );

  client.log('Ready to receive prefix commands');
}