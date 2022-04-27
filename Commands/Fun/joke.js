const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

module.exports = new Command({
  name: 'joke',
  aliases: [],
  description: `sends a joke`,
  permissions: {client: [100], user: []},
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
    let APIs = [
      { name: 'jokeAPI', url: 'https://v2.jokeapi.dev' },
      { name: 'humorAPI', url: 'https://humorapi.com' },
      { name: 'webknox-jokes', url: 'https://webknox-jokes.p.rapidapi.com' },
      { name: 'joke3', url: 'https://joke3.p.rapidapi.com' },
      { name: 'icanhazdadjoke', url: 'https://icanhazdadjoke.com' }
    ];
    let response; let type;
    if(interaction) { type = interaction.options?.type }
    else { type = message.args[0] };
    
    async function getJoke(APIs) {
      API = APIs[Math.floor(Math.random() * APIs.length)];
      let options;
      
      try {
        switch(API.name) {
          case 'jokeAPI':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://v2.jokeapi.dev/joke/Any',
              params: { 'lang': 'en' }
            }
            
            await axios.request(options).then(r => {
              if(r.data.type === 'twopart') {
                response = r.data.setup +
                  `\n\n||` + r.data.delivery + '||'
              } else { response = r.data.joke }
            })
            break;
        
          case 'humorAPI':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://api.humorapi.com/jokes/random',
              params: {
                'api-key': client.keys.jokes.humorAPIKey,
                'min-rating': '7',
                'max-length': '2000'
              }
            };
            if(type) options.params['include-tags'] = type;
            
            await axios.request(options).then(r => {
              if(r.data.joke.search('Q: ') == -1) { response = r.data.joke }
              else {
                response = r.data.joke
                  .replace('Q: ','')
                  .replace('A: ', '\n||') + '||\n'
              }
            })
            break;
            
          case 'webknox-jokes':
            options = {
              method: 'GET',
              timeout: 2500,
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
	           response = r.data.joke
            });
            break;
            
          case 'joke3':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://joke3.p.rapidapi.com/v1/joke',
              headers: {
                'X-RapidAPI-Host': 'joke3.p.rapidapi.com',
                'X-RapidAPI-Key': client.keys.jokes.rapidAPIKey
              }
            };
            await axios.request(options).then(r => {
	           response = r.data.joke
            });
            break;
            
          case 'icanhazdadjoke':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://icanhazdadjoke.com',
              headers: {
                'User-Agent': 'My discord bot (https://github.com/Mephisto5558/Teufelswerk-Bot)',
                'Accept': 'application/json'
              }
            };
            await axios.request(options).then(r => {
              response = r.data.joke
            });
            break;
        }
      }
      catch(err) {
        const errorCodes = [402, 403, 522];
        if(errorCodes.indexOf(err.status) > -1) {
          console.error('joke.js: ')
          console.error(err.response)
        }
        else {
          console.error(`joke.js: ${API.url} responded with error ` +
            err.status + ', ' + err.statusText + ': ' + err.response?.data?.message
          )
        }
        console.error('Trying next api');
        APIs = APIs.filter(str => str.name !== API.name)
        if(APIs) await getJoke(APIs);
      }
    }

    await getJoke(APIs);

    if(!response) {
      if(message) return client.functions.reply('Apparently, there is currently no API available. Please try again later.', message);
      return interaction.followUp('Apparently, there is currently no API available. Please try again later.');
    };
    
    response.replace('`', "'");
    let embed = new MessageEmbed()
      .setTitle('Is this funny?')
      .setDescription(response + `\n- [${API.name}](${API.url})`);
    
    if(message) return client.functions.reply({ embeds: [embed] }, message);
    interaction.followUp({ embeds: [embed] })
  }
})