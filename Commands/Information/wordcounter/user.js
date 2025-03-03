/** @type {import('.').default} */
module.exports = {
  options: [
    {
      name: 'enable',
      type: 'Subcommand',
      options: [{
        name: 'enabled',
        type: 'Boolean',
        required: true
      }]
    },
    { name: 'get', type: 'Subcommand' }
  ],

  async run(lang) {

  }
};