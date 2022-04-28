const { Command } = require("reconlx");

module.exports = new Command({
  name: '',
  alias: [],
  description: '',
  permissions: { client: [], user: [] },
  category : '',
  slashCommand: true,
  prefixCommand: true,
  disabled: false,
  args: {
    option1: [],
    option2: []
  },
  options: [{
    name: '',
    description: '',
    type: '',
    required: false
  }],
  choices: [{
    name: '',
    value: ''
  }],
  
  run: async (client, message, interaction) => {


    
  }
})