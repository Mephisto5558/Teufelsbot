const
  { EmbedBuilder, Colors, Message, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'),
  { getTarget } = require('../../Utils'),
  { mgStats_formatTopTen: formatTopTen } = require('../../Utils/componentHandler/'),
  sortOptions = ['m_wins', 'f_wins', 'm_draws', 'f_draws', 'm_loses', 'f_loses', 'm_alphabet_user', 'f_alphabet_user', 'm_alphabet_nick', 'f_alphabet_nick'],
  manageData = data => Object.entries(data || {}).sort(([, a], [, b]) => b - a).slice(0, 3).reduce((acc, e) => acc + `> <@${e[0]}>: \`${e[1]}\`\n`, '');

function formatStatCount(input, all) {
  input = parseInt(input);
  all = parseInt(all);

  if (isNaN(input)) return '`0`';
  if (isNaN(all)) throw new SyntaxError('arg all must be typeof Number! Got NaN');

  return `\`${input}\`` + all ? `(\`${parseFloat((input / all * 100).toFixed(2))}%\`)` : '';
}

/**@type {command}*/
module.exports = {
  name: 'mgstats',
  aliases: { prefix: ['leaderboard'], slash: ['leaderboard'] },
  cooldowns: { user: 1000 },
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
          name: 'sort',
          type: 'String',
          choices: sortOptions
        },
        {
          name: 'settings',
          type: 'String',
          choices: ['all_users']
        }
      ]
    }
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    if (this instanceof Message && !this.args[0]) return this.customReply(lang('missingGameArg'));

    const
      type = this.options?.getSubcommand() || 'user',
      target = getTarget.call(this, { returnSelf: true }),
      settings = this.options?.getString('settings'),
      leaderboards = this.client.db.get('leaderboards'),
      [game, data] = Object.entries(leaderboards).find(([k]) => k.toLowerCase() == (this.options?.getString('game') || this.args[0]).toLowerCase()) || [],
      [sort, mode] = this.options?.getString('sort')?.split('_') || [];

    if (!data) return this.customReply(lang('notFound', Object.keys(leaderboards).join('`, `')));

    const embed = new EmbedBuilder({
      color: Colors.Blurple,
      footer: {
        text: this.member.user.tag,
        iconURL: this.member.displayAvatarURL()
      }
    });

    if (type == 'user') {
      embed.data.title = lang('embedTitle', { user: target.tag, game });

      const targetData = data?.[target.id];
      if (targetData?.games) {
        embed.data.description =
          lang('games', targetData.games) +
          lang('wins', formatStatCount(targetData.wins, targetData.games) || '`0`') +
          lang('draws', formatStatCount(targetData.draws, targetData.games) || '`0`') +
          lang('loses', formatStatCount(targetData.loses, targetData.games) || '`0`');

        if (targetData.wonAgainst) embed.data.description += lang('wonAgainst') + (manageData(targetData.wonAgainst) || '> ' + lang('noOne')) + '\n';
        if (targetData.lostAgainst) embed.data.description += lang('lostAgainst') + (manageData(targetData.lostAgainst) || '> ' + lang('noOne')) + '\n';
        if (targetData.drewAgainst) embed.data.description += lang('drewAgainst') + (manageData(targetData.drewAgainst) || '> ' + lang('noOne'));
      }
      else embed.data.description = target.id == this.member.id ? lang('youNoGamesPlayed', game) : lang('userNoGamesPlayed', { user: target.username, game });

      return this.customReply({ embeds: [embed] });
    }

    await this.guild.members.fetch();

    embed.data.title = lang('embedTitleTop10', game);
    embed.data.description = await formatTopTen.call(this, Object.entries(data).filter(([e]) => settings == 'all_users' || this.guild.members.cache.has(e)), sort, mode, lang) || lang('noPlayers');

    const component = new ActionRowBuilder({
      components: [new StringSelectMenuBuilder({
        customId: `mgstats.${game}.sort.${settings}`,
        options: sortOptions.map(value => ({
          label: lang(`options.leaderboard.options.sort.choices.${value}`), value,
          default: value == (sort ? `${sort}_${mode}` : 'm_wins')
        }))
      })]
    });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};
