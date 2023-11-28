/**@type {command}*/
module.exports = {
  name: 'ban',
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    {
      name: 'delete_days_of_messages',
      type: 'Number',
      minValue: 1,
      maxValue: 7
    },
    { name: 'target', type: 'User' }
    /* {
      name: 'duration',
      type: 'String',
      autocompleteOptions: function () { return timeValidator(this.focused.value); } }
    */
  ],

  run: require('../../Utils').bankick
};