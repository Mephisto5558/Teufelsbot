/** @type {command<'slash'>} */
module.exports = {
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  options: [
    { name: 'guild', type: 'SubcommandGroup' },
    {
      name: 'channel',
      type: 'SubcommandGroup',
      dmPermission: false
    },
    { name: 'user', type: 'SubcommandGroup' }
  ],

  run: undefined
};