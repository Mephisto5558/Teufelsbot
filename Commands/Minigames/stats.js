const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

async function manageData(input, clientID) {
  if (!input) return;

  let output = '';
  const data = Object.entries(input)
    .sort(([, a], [, b]) => b - a);

  for (let i = 0; i < data.length && i < 3; i++) {
    output += `> <@${data[i][0]}>: \`${data[i][1]}\`\n`;
  }

  return output.replace(/AI/g, clientID);
}

async function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (Number.isNaN(all)) throw new SyntaxError('arg all must be NUMBER! Got NaN');

  if (input != 0 && !input) return '`0`';
  if (!all) return `\`${input}\``;

  return `\`${input}\` (\`${parseFloat((input / all * 100).toFixed(2))}%\`)`;
}

async function formatTopTen(input, settings, message, client) {
  let output = '';
  let i = 0;
  let isInGuild;
  const medals = [':first_place:', ':second_place:', ':third_place:'];

  const data = Object.entries(input)
    .filter(a => a[0] != 'AI')
    .sort(([, a], [, b]) => {
      if (a.wins != b.wins) return b.wins - a.wins;
      if (a.loses != b.loses) return a.loses - b.loses;
      if (a.draws != b.draws) return a.draws - b.draws;
      return 0;
    })
    .slice(0, 10);

  for (const entry of data) {
    await client.rateLimitCheck(`/guilds/${message.guild.id}/members/:id`);
    try {
      await message.guild.members.fetch(entry[0]);
      isInGuild = true
    }
    catch { isInGuild = false }

    if (!entry[1].wins || (settings != 'all_users' && !isInGuild)) continue;
    if (output.length > 3997) {
      output += '...';
      break;
    }

    output +=
      `${medals[i] || `${i}.`} <@${entry[0]}>\n` +
      `> Wins: ${entry[1].wins || 0}\n` +
      `> Loses: ${entry[1].loses || 0}\n` +
      `> Draws: ${entry[1].draws || 0}\n\n`;
    i++;
  }
  return output;
}

module.exports = new Command({
  name: 'stats',
  aliases: { prefix: ['leaderboard'], slash: ['leaderboard'] },
  description: 'get stats about one of the minigames',
  usage: 'PREFIX Command: stats <game> [target]',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'user',
      description: 'get stats about yourself or a specific user',
      type: 'Subcommand',
      options: [
        {
          name: 'game',
          description: 'which game you want to get stats about',
          type: 'String',
          required: true,
          choices: [
            { name: 'TicTacToe', value: 'TicTacToe' }
          ]
        },
        {
          name: 'target',
          description: 'which user you want to get stats about',
          type: 'User',
          required: false
        }
      ]
    },
    {
      name: 'leaderboard',
      description: 'get the top 10 players of a game',
      type: 'Subcommand',
      options: [
        {
          name: 'game',
          description: 'which game you want to get stats about',
          type: 'String',
          required: true,
          choices: [
            { name: 'TicTacToe', value: 'TicTacToe' }
          ]
        },
        {
          name: 'settings',
          description: 'Apply/Disapply filters to the leaderboard',
          type: 'String',
          required: false,
          choices: [
            { name: 'do_not_limit_to_guild_members', value: 'all_users' }
          ]
        }
      ]
    }
  ],

  run: async (client, message, interaction) => {
    const stats = {};
    if (message) {
      if (!message.args[0]) return client.functions.reply('You need to give me a `game` as first argument!', message);
      stats.type = 'user'
      stats.game = message.args[0].replace(/tictactoe/gi, 'TicTacToe')
      stats.target = message.mentions.users?.first() || message.author;
    }
    else {
      message = interaction
      stats.type = interaction.options.getSubcommand()
      stats.game = interaction.options.getString('game')
      stats.target = interaction.options.getUser('target') || interaction.user
      stats.settings = interaction.options.getString('settings');
    }
    
    const leaderboards = await client.db.get('leaderboards');

    stats.data = Object.entries(leaderboards).find(([k]) => k.toLowerCase() == stats.game.toLowerCase())?.[1];
    if (!stats.data) {
      const msg =
        'This is not a valid game entry. Valid games are:\n`' +
        Object.keys(leaderboards).join('`, `') + '`';

      return interaction ? interaction.editReply(msg) : client.functions.reply(msg, message);
    }

    const embed = new EmbedBuilder({
      color: Colors.Blurple,
      footer: {
        text: message.member.user.tag,
        iconURL: message.member.user.displayAvatarURL()
      }
    });

    if (stats.type == 'user') {
      const rawStats = stats.data?.[stats.target.id];

      embed.data.title = `\`${stats.target.tag}\`'s ${stats.game} Stats`;

      if (rawStats && rawStats.games) {
        embed.data.description =
          `Games: \`${rawStats?.games}\`\n\n` +
          `Wins:  ${await formatStatCount(rawStats.wins, rawStats.games) || '`0`'}\n` +
          `Draws: ${await formatStatCount(rawStats.draws, rawStats.games) || '`0`'}\n` +
          `Loses: ${await formatStatCount(rawStats.loses, rawStats.games) || '`0`'}\n\n` +

          `Won against:\n` +
          `${await manageData(rawStats.wonAgainst, client.user.id) || '> no one\n'}\n` +
          `Lost against:\n` +
          `${await manageData(rawStats.lostAgainst, client.user.id) || '> no one\n'}\n` +
          `Drew against:\n` +
          `${await manageData(rawStats.drewAgainst, client.user.id) || '> no one\n'}`
      }
      else
        embed.data.description = `${stats.target.id == message.member.id ? 'You have' : `${stats.target.username} has`} not played any ${stats.game} games yet.`;
    }
    else if (stats.type == 'leaderboard') {
      embed.data.title = `Top 10 ${stats.game} players`;
      embed.data.description = await formatTopTen(stats.data, stats.settings, message), client || 'It looks like no one won yet...';
    }

    interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
  }
})