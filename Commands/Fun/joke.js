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
    let APIs = ['v2.jokeapi.dev', 'api.humorapi.com', 'webknox-jokes'];
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
            
            await axios.request(options).then(r => {
              if(r.data.type === 'twopart') {
                response = r.data.setup +
                  `\n\n||` + r.data.delivery + '||\nhttps://v2.jokeapi.dev'
              } else { response = r.data.joke + '\nhttps://v2.jokeapi.dev' }
            })
            break;
        
          case 'api.humorapi.com':
            options = {
              method: 'GET',
              url: 'https://api.humorapi.com/jokes/random',
              params: {
                'api-key': client.keys.jokes.humorAPIKey,
                'min-rating': '7',
                'max-length': '2000'
              }
            };
            if(type) options.params['include-tags'] = type;
            
            await axios.request(options).then(r => {
              if(r.data.joke.search('Q: ') == -1) { response = r.data.joke + '\nhttps://humorapi.com' }
              else {
                response = r.data.joke
                  .replace('Q: ','')
                  .replace('A: ', '\n||') + '||\nhttps://humorapi.com'
              }
            })
            break;
            
          case 'webknox-jokes':
            options = {
              method: 'GET',
              url: 'https://webknox-jokes.p.rapidapi.com/jokes/random',
              params: {
                minRating: '7',
                maxLength: '2000'
              },
              headers: {
                'X-RapidAPI-Host': 'webknox-jokes.p.rapidapi.com',
                'X-RapidAPI-Key': client.keys.jokes.rapidAPIKey
              }
            };
            await axios.request(options).then(r => {
	           response = r.data.joke + '\nhttps://webknox-jokes.p.rapidapi.com'
            });
            break;
        }
      }
      catch(err) {
        if(err.response.status != 402) { console.error(err.response) }
        else {
          console.error(`joke.js: ${API} responded with error:` +
            err.response.status + ', ' + err.response.statusText + ': ' + err.response.data.message
          )
        }
        console.error('Trying next api');
        APIs = APIs.filter(str => str !== API)
        if(APIs) await getJoke(APIs);
      }
    }

    await getJoke(APIs);

    if(!response) {
      if(message) return client.functions.reply('Apparently, there is currently no API available. Please try again later.', message);
      return interaction.followUp('Apparently, there is currently no API available. Please try again later.');
    };
    
    response.replace('`', "'");
    
    if(message) return client.functions.reply(response, message);
    interaction.followUp(response)
  }
})