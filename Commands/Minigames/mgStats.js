const { EmbedBuilder, Colors, Message } = require('discord.js');

async function manageData(input, clientID) {
  if (!input) return;

  let output = '';
  const data = Object.entries(input)
    .sort(([, a], [, b]) => b - a);

  for (let i = 0; i < data.length && i < 3; i++) {
    output += `> <@${data[i][0]}>: \`${data[i][1]}\`\n`;
  }

  return output.replaceAll('AI', clientID);
}

async function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (Number.isNaN(all)) throw new SyntaxError('arg all must be NUMBER! Got NaN');

  if (input != 0 && !input) return '`0`';
  if (!all) return `\`${input}\``;

  return `\`${input}\` (\`${parseFloat((input / all * 100).toFixed(2))}%\`)`;
}

async function formatTopTen(input, settings, message, lang) {
  let output = '';
  let i = 0;
  let isInGuild;

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
      `${[':first_place:', ':second_place:', ':third_place:'][i] || i + '.'} <@${entry[0]}>\n` +
      '> ' + lang('wins', entry[1].wins || 0) +
      '> ' + lang('loses', entry[1].loses || 0) +
      '> ' + lang('draws', entry[1].draws || 0);
    i++;
  }
  return output;
}

module.exports = {
  name: 'mgstats',
  aliases: { prefix: ['leaderboard'], slash: ['leaderboard'] },
  description: 'get stats about one of the minigames',
  usage: 'PREFIX Command: mgstats <game> [target]',
  permissions: { client: [], user: [] },
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

  run: async (message, lang, client) => {
    if (message instanceof Message && !message.args[0])
      return message.customReply(lang('missingGameArg'));

    const stats = {
      type: message.options?.getSubcommand() || 'user',
      game: message.options?.getString('game') || message.args[0].replace(/tictactoe/gi, 'TicTacToe'),
      target: message.options?.getUser('target') || message.mentions?.users?.first() || message.member,
      settings: message.options?.getString('settings')
    }
    const leaderboards = client.db.get('leaderboards');

    stats.data = Object.entries(leaderboards).find(([k]) => k.toLowerCase() == stats.game.toLowerCase())?.[1];
    if (!stats.data) return message.customReply(lang('notFound', Object.keys(leaderboards).join('`, `')));

    const embed = new EmbedBuilder({
      color: Colors.Blurple,
      footer: {
        text: message.member.user.tag,
        iconURL: message.member.displayAvatarURL()
      }
    });

    if (stats.type == 'user') {
      const rawStats = stats.data?.[stats.target.id];

      embed.data.title = `\`${stats.target.tag}\`'s ${stats.game} Stats`;

      if (rawStats && rawStats.games) {
        embed.data.description =
          lang('games', rawStats?.game) +
          lang('wins', await formatStatCount(rawStats.wins, rawStats.games) || '`0`') +
          lang('draws', await formatStatCount(rawStats.draws, rawStats.games) || '`0`') +
          lang('loses', await formatStatCount(rawStats.loses, rawStats.games) || '`0`') +

          `${lang('wonAgainst')}\n` +
          `${await manageData(rawStats.wonAgainst, client.user.id) || '>' + lang('noOne')}\n` +
          `${lang('lostAgainst')}\n` +
          `${await manageData(rawStats.lostAgainst, client.user.id) || '>' + lang('noOne')}\n` +
          `${lang('drewAgainst')}\n` +
          `${await manageData(rawStats.drewAgainst, client.user.id) || '>' + lang('noOne')}`
      }
      else embed.data.description = stats.target.id == message.member.id ? lang('youNoGamesPlayed', stats.game) : lang('usrNoGamesPlayed', stats.target.username, stats.game);
    }
    else if (stats.type == 'leaderboard') {
      embed.data.title = lang('embedTitleTop10', stats.game);
      embed.data.description = await formatTopTen(stats.data, stats.settings, message, lang) || lang('noWinners');
    }

    message.customReply({ embeds: [embed] });
  }
}