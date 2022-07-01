const { Command } = require('reconlx');
const responseList = [
  'Naiiiiiin D:',
  'Ich würde niemals gehen!',
  'Bananensaft schmeckt lecker',
  'Ich kann garnicht weg sein, der Meph hält mich in seinem Keller gefangen und zwingt mich hier zu arbeiten! Hilf mir!!!!',
];

let response;

module.exports = new Command({
  name: 'bistduweg',
  alias: [],
  description: 'sagt nix wenn er weg is',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 200, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    const random = Math.random() * 10;

    if(random > 5) response = responseList[0]; //50%
    else if(random > 1) response = responseList[1]; //40%
    else if(random > 0.01) response = responseList[2]; //9.99%
    else response = responseList[3]; //0.01%

    client.functions.reply(response, message);
  }
})