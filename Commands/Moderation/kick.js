module.exports = {
  name: 'kick',
  permissions: { client: ['KickMembers'], user: ['KickMembers'] },
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

  run: require('../../Utils').bankick
};
