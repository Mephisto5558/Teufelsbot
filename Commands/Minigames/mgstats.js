const { EmbedBuilder, Colors, Message } = require('discord.js');

function manageData(input, clientID) {
  if (!input) return;

  let output = '';
  const data = Object.entries(input).sort(([, a], [, b]) => b - a);

  for (let i = 0; i < data.length && i < 3; i++) output += `> <@${data[i][0]}>: \`${data[i][1]}\`\n`;

  return output.replaceAll('AI', clientID);
}

function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (Number.isNaN(all)) throw new SyntaxError('arg all must be NUMBER! Got NaN');

  if (input != 0 && !input) return '`0`';
  if (!all) return `\`${input}\``;

  return `\`${input}\` (\`${parseFloat((input / all * 100).toFixed(2))}%\`)`;
}

async function formatTopTen(input, settings, lang) {
  let output = '';
  let i = 0;
  let isInGuild;

  const data = Object.entries(input)
    .filter(a => a[0] != 'AI')
    .sort(([, a], [, b]) => b.wins - a.wins || a.draws - b.draws || a.loses - b.loses)
    .slice(0, 10);

  for (const entry of data) {
    try {
      await this.guild.members.fetch(entry[0]);
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
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'user',
      type: 'Subcommand',
      options: [
        {
          name: 'game',
          type: 'String',
          required: true,
          choices: ['tictactoe']
        },
        { name: 'target', type: 'User' }
      ]
    },
    {
      name: 'leaderboard',
      type: 'Subcommand',
      options: [
        {
          name: 'game',
          type: 'String',
          required: true,
          choices: ['tictactoe']
        },
        {
          name: 'settings',
          type: 'String',
          choices: ['all_users']
        }
      ]
    }
  ],

  run: async function (lang, client) {
    if (this instanceof Message && !this.args[0])
      return this.customReply(lang('missingGameArg'));

    const stats = {
      type: this.options?.getSubcommand() || 'user',
      game: this.options?.getString('game') || this.args[0].replace(/tictactoe/gi, 'TicTacToe'),
      target: this.options?.getUser('target') || this.mentions?.users.first() || this.user,
      settings: this.options?.getString('settings')
    }
    const leaderboards = client.db.get('leaderboards');

    stats.data = Object.entries(leaderboards).find(([k]) => k.toLowerCase() == stats.game.toLowerCase())?.[1];
    if (!stats.data) return this.customReply(lang('notFound', Object.keys(leaderboards).join('`, `')));

    const embed = new EmbedBuilder({
      color: Colors.Blurple,
      footer: {
        text: this.member.user.tag,
        iconURL: this.member.displayAvatarURL()
      }
    });

    if (stats.type == 'user') {
      const rawStats = stats.data?.[stats.target.id];

      embed.data.title = lang('embedTitle', { user: stats.target.tag, game: stats.game });

      if (rawStats && rawStats.games) {
        embed.data.description =
          lang('games', rawStats.games) +
          lang('wins', formatStatCount(rawStats.wins, rawStats.games) || '`0`') +
          lang('draws', formatStatCount(rawStats.draws, rawStats.games) || '`0`') +
          lang('loses', formatStatCount(rawStats.loses, rawStats.games) || '`0`');

        if (rawStats.wonAgainst) embed.data.description += lang('wonAgainst') + (manageData(rawStats.wonAgainst, client.user.id) || '> ' + lang('noOne')) + '\n';
        if (rawStats.lostAgainst) embed.data.description += lang('lostAgainst') + (manageData(rawStats.lostAgainst, client.user.id) || '> ' + lang('noOne')) + '\n';
        if (rawStats.drewAgainst) embed.data.description += lang('drewAgainst') + (manageData(rawStats.drewAgainst, client.user.id) || '> ' + lang('noOne'));
      }
      else embed.data.description = stats.target.id == this.member.id ? lang('youNoGamesPlayed', stats.game) : lang('usrNoGamesPlayed', { user: stats.target.username, game: stats.game });
    }
    else if (stats.type == 'leaderboard') {
      embed.data.title = lang('embedTitleTop10', stats.game);
      embed.data.description = await formatTopTen.call(this, stats.data, stats.settings, lang) || lang('noWinners');
    }

    this.customReply({ embeds: [embed] });
  }
}
