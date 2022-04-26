const { Command } = require("reconlx");

module.exports = new Command({
  name: 'joke',
  aliases: [],
  description: `sends a joke`,
  permissions: {client: [], user: []},
  category : "Fun",
  slashCommand: true,
  
  run: async (client, message, interaction) => {
    const axios = require('axios');
    axios.get('https://v2.jokeapi.dev/joke/Any?lang=de&type=single')
      .then(response => {
        response = response.data.joke
        if(message) return client.functions.reply(response, message);
        interaction.followUp(response)
      })
      .catch(err => {
        console.log(err)
        if(message) return client.functions.reply("The joke API is currently not available", message);
        interaction.followUp("The joke API is currently not available")
      })
  }
})