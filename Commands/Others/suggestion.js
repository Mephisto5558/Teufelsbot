const { Command } = require('reconlx');
const axios = require('axios').default;

module.exports = new Command({
  name: 'suggestion',
  alias: [],
  description: 'Suggest a feature for the bot.',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Others',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'title',
      description: 'the title of your suggestion',
      type: 'STRING',
      required: true
    },
    {
      name: 'suggestion',
      description: 'your suggestion. Gets send to github.',
      type: 'STRING',
      required: true
    },
    {
      name: 'importance',
      description: 'how important you think your suggestion is',
      type: 'STRING',
      required: true,
      choices: [
        { name: 'low', value: 'Low' },
        { name: 'medium', value: 'Medium' },
        { name: 'high', value: 'High' }
      ]
    }
  ],

  run: async (_, _, interaction) => {

    axios.post('https://eo4g01d5kqvc5ys.m.pipedream.net', {
      "event": "newSuggestion",
      "guild": interaction.guild.id,
      "user": {
        "name": interaction.user.tag,
        "id": interaction.user.id
      },
      "content": {
        "title": interaction.options.getString('title'),
        "text": interaction.options.getString('suggestion'),
        "priority": `${interaction.options.getString('importance')} importance`
      }
    })
      .then(res => {
        interaction.editReply(
          res.data.body.message +
          res.data.body.link
        )
      })
      .catch(err => {
        console.error(err.response);
        interaction.editReply(`An error occurred.\n${res.response.statusText}`)
      });

  }
})