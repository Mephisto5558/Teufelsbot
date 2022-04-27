const { Command } = require("reconlx");

module.exports = new Command({
  name: 'joke',
  aliases: [],
  description: `sends a joke`,
  permissions: {client: [], user: []},
  category : "Fun",
  slashCommand: true,
  options: [{
    name: 'type',
    description: `The type/tag of the joke (not all apis support types/tags)`,
    type: 'STRING',
    required: false
  }],
  
  run: async (client, message, interaction) => {
    
    const axios = require('axios');
    let APIs = ['v2.jokeapi.dev', 'api.humorapi.com'];
    let response; let type;
    if(interaction) { type = interaction.options?.type }
    else { type = message.args[0] };
    
    async function getJoke(APIs) {
      API = APIs[Math.floor(Math.random() * APIs.length)];
      let options;
      try {
        switch(API) {
          case 'v2.jokeapi.dev':
            options = {
              method: 'GET',
              url: 'https://v2.jokeapi.dev/joke/Any',
              params: { 'lang': 'en' }
            }
            
            await axios.request(options)
              .then(r => {
                if(r.data.type === 'twopart') {
                  response = r.data.setup +
                    `\n\n||` + r.data.delivery + '||'
                } else { response = r.data.joke }
              })
            break;
        
          case 'api.humorapi.com':
            options = {
              method: 'GET',
              url: 'https://api.humorapi.com/jokes/random',
              params: {
                'api-key': client.keys.jokes.humorAPIKey,
                'max-length': '2000',
                'min-rating': '7'
              }
            };
            if(type) options.params['include-tags'] = type;
            
            await axios.request(options)
              .then(r => {
                if(r.data.joke.search('Q: ') == -1) { response = r.data.joke }
                else {
                  response = r.data.joke
                    .replace('Q: ','')
                    .replace('A: ', '\n||') + '||'
                }
              })
            break;
        }
      }
      catch(err) {
        console.error(err);
        console.error('trying next api');
        APIs = APIs.filter(str => str !== API)
        await getJoke(APIs);
      }
    }

    await getJoke(APIs);

    if(!response) {
      if(message) return client.functions.reply('an error occurred', message);
      return interaction.followUp('an error occurred');
    }
    response.replace('`', "'");
    
    if(message) return client.functions.reply(response, message);
    interaction.followUp(response)
  }
})