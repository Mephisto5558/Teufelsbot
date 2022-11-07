module.exports = {
  name: 'kick',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
      type: 'String',
      required: true
    }
  ],

  run: require('../../Utils/bankick.js')
};
