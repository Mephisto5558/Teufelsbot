/** @type {command<'slash'>} */
module.exports = {
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  options: [
    { name: 'guild', type: 'Subcommand' },
    {
      name: 'channel',
      type: 'Subcommand',
      dmPermission: false
    },
    { name: 'user', type: 'Subcommand' }
  ],

  run: undefined
};