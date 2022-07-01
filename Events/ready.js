module.exports = async client => {
  client.user.setActivity(await client.db.get('activity') || { name: '/help', type: 'PLAYING' });

  client.log('Ready to receive prefix commands');
}