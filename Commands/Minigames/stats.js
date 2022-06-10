const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

async function manageData(input, clientID) {
  if (!input) return;

  let output = '';
  const data = Object.entries(input)
    .sort(([, a], [, b]) => b - a);

  for (let i = 0; i < data.length && i < 3; i++) {
    output += `> <@${data[i][0]}>: \`${data[i][1]}\`\n`;
  }

  return output.replace('AI', clientID);
}

async function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (Number.isNaN(all)) throw new SyntaxError('arg all must be NUMBER! Got NaN');

  if (input != 0 && !input) return '`0`';
  if (!all) return `\`${input}\``;

  return `\`${input}\` (\`${parseFloat((input / all * 100).toFixed(2))}%\`)`;
}

async function formatTopTen(input, settings, interaction) {
  let output = '';
  let i = 0;
  let isInGuild;
  const medals = [':first_place:', ':second_place:', ':third_place:'];

  const data = Object.entries(input)
    .filter(a => a[0] != 'AI')
    .sort(([, a], [, b]) => b.wins - a.wins)
    .slice(0, 10);

  for (const entry of data) {
    try {
      await interaction.guild.members.fetch(entry[0]);
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
  aliases: [],
  description: 'get stats about one of the minigames',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: false,
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
          description: 'Apply/Disapply filters to the leaderboard',
          type: 'STRING',
          required: false,
          choices: [
            { name: 'dont_limit_to_guild_members', value: 'all_users' }
          ]
        }
      ]
    }
  ],

  run: async (client, _, interaction) => {
    const stats = {
      type: interaction.options.getSubcommand(),
      game: interaction.options.getString('game'),
      target: interaction.options.getUser('target') || interaction.user,
      settings: interaction.options.getString('settings')
    }
    stats.data = await client.db.get('leaderboards')[stats.game];

    const embed = new MessageEmbed()
      .setColor(colors.discord.BURPLE)
      .setFooter({
        text: interaction.member.user.tag,
        iconURL: interaction.member.user.displayAvatarURL()
      });

    if (stats.type == 'user') {
      const rawStats = stats.data?.[stats.target.id];

      embed.setTitle(`\`${stats.target.tag}\`'s ${stats.game} Stats`);

      if (rawStats && rawStats.games) {
        embed.setDescription(
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
        )
      }
      else
        embed.setDescription(`${stats.target.id == interaction.user.id ? 'You have' : `${stats.target.username} has`} not played any ${stats.game} games yet.`);
    }
    else if (stats.type == 'leaderboard') {
      embed
        .setTitle(`Top 10 ${stats.game} players`)
        .setDescription(await formatTopTen(stats.data, stats.settings, interaction) || 'It looks like no one won yet...');
    }

    interaction.editReply({ embeds: [embed] });

  }
})