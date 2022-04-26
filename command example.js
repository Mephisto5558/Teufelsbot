const { Command } = require("reconlx");

module.exports = new Command({
  name: '',
  alias: [],
  description: '',
  permissions: {client: [], user: []},
  category : '',
  slashCommand: true,
  disabled: false,
  options: [{
    name: '',
    description: '',
    type: '',
    required: false
  }],
  
  run: async (client, message, interaction) => {


    
  }
})