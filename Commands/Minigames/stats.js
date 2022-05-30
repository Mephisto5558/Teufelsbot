const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  embedConfig = require('../../Settings/embed.json').colors;

async function manageData(input, clientID) {
  if (!input) return;

  let output = '';
  let data = Object.entries(input)
    .sort(([,a], [,b]) => b - a);

  for (i = 0; i < data.length && i < 3; i++) {
    output += `> <@${data[i][0]}>: \`${data[i][1]}\`\n`;
  }

  return output.replace('AI', clientID);;
}

async function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (Number.isNaN(all)) throw new SyntaxError('arg all must be NUMBER! Got NaN');

  if (input != 0 && !input) return '`0`';
  if (!all) return `\`${input}\``;

  let relative = (input / all) * 100;
  return `\`${input}\` (\`${relative.toFixed(2)}%\`)`;
}

async function formatTopTen(input, settings, interaction) {
  let output = '';
  let data = Object.entries(input)
    .sort(([,a], [,b]) => b.wins - a.wins);

  for(entry of data) {
    if( entry[0] == 'AI' || (settings != 'all' && (await interaction.guild.members.fetch(entry[0])) == false) ) continue;
    if(output.length > 3997) {
      output += '...';
      break;
    }

    output +=
      `<@${entry[0]}>:\n` +
      `> Wins: ${entry[1].wins || 0}\n` +
      `> Loses: ${entry[1].loses || 0}\n` +
      `> Draws: ${entry[1].draws || 0}\n\n`;
  }
  return output;
}

module.exports = new Command({
  name: 'stats',
  aliases: [],
  description: 'get stats about one of the minigames',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: '',
  slashCommand: true,
  prefixCommand: false, beta: true,
  options: [
    {
      name: 'user',
      description: 'get stats about yourself or a specific user',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'game',
          description: 'which game you want to get stats about',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'TicTacToe', value: 'TicTacToe' }
          ]
        },
        {
          name: 'target',
          description: 'which user you want to get stats about',
          type: 'USER',
          required: false
        }
      ]
    },
    {
      name: 'leaderboard',
      description: 'get the top 10 players of a game',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'game',
          description: 'which game you want to get stats about',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'TicTacToe', value: 'TicTacToe' }
          ]
        },
        {
          name: 'settings',
          description: 'only needed for leaderboard. Filters the leaderboard',
          type: 'STRING',
          required: false,
          choices: [
            { name: 'all_users', value: 'all_users' }
          ]
        }
      ]
    }
  ],

  run: async (client, _, interaction) => {
    let stats = {
      type: interaction.options.getSubcommand(),
      game: interaction.options.getString('game'),
      target: interaction.options.getUser('target') || interaction.user,
      settings: interaction.options.getString('settings')
    }
    stats.data = { raw: (await client.db.get('leaderboards'))[stats.game] };

    let embed = new MessageEmbed()
      .setColor(embedConfig.discord.BURPLE)
      .setFooter({
        text: `${interaction.member.user.tag}`,
        iconURL: interaction.member.user.displayAvatarURL()
      });

    if (stats.type == 'user') {
      let rawStats = stats.data.raw?.[stats.target.id];
      let userStats;

      if(rawStats) {
        if(!rawStats.games) rawStats.games = 0;
        userStats = {
          wonAgainst: await manageData(rawStats.wonAgainst, client.user.id),
          lostAgainst: await manageData(rawStats.lostAgainst, client.user.id),
          drewAgainst: await manageData(rawStats.drewAgainst, client.user.id),

          wins: await formatStatCount(rawStats.wins, rawStats.games),
          draws: await formatStatCount(rawStats.draws, rawStats.games),
          loses: await formatStatCount(rawStats.loses, rawStats.games)
        }
      }

      embed
        .setTitle(`\`${stats.target.tag}\`'s ${stats.game} Stats`)
        .setDescription(
          `Games: \`${rawStats?.games || 0}\`\n\n` +
          `Wins:  ${userStats?.wins  || '`0`'}\n` +
          `Draws: ${userStats?.draws || '`0`'}\n` +
          `Loses: ${userStats?.loses || '`0`'}\n\n` +

          `Won against:\n` +
          `${userStats?.wonAgainst || '> no one\n'}\n` +
          `Lost against:\n` +
          `${userStats?.lostAgainst || '> no one\n'}\n` +
          `Drew against:\n` +
          `${userStats?.drewAgainst || '> no one\n'}`
        )
    }
    else if (stats.type == 'leaderboard') {
      if(stats.data.raw)
        stats.data.formatted = { top10: formatTopTen(stats.data.raw, stats.settings, interaction) };
        console.log(!!await (await client.guilds.fetch("732266869549170719")).members.cache.find("778360894908268565"))
      embed
        .setTitle(`Top 10 ${stats.game} players`)
        .setDescription(stats.data.formatted?.top10 || 'looks like no one played yet...');
    }

    return interaction.editReply({ embeds: [embed] });

  }
})