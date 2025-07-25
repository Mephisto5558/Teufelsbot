const
  { EmbedBuilder, Colors, Message, ActionRowBuilder, StringSelectMenuBuilder, userMention, inlineCode, bold } = require('discord.js'),
  { getTargetMembers, getCommandName, constants: { embedDescriptionMaxLength }, timeFormatter: { msInSecond } } = require('#Utils'),
  { mgStats_formatTop: formatTop } = require('#Utils/componentHandler'),
  sortOptions = [
    'm_wins', 'f_wins', 'm_draws', 'f_draws', 'm_losses', 'f_losses',
    'm_alphabet_user', 'f_alphabet_user', 'm_alphabet_nick', 'f_alphabet_nick'
  ],
  TOPLIST_MAX_USERS = 3,
  maxPercentage = 100;

/**
 * @this {GuildInteraction | Message<true>}
 * @param {Record<string, number> | undefined} data */
function manageData(data) {
  if (!data) return;

  return Object.entries(data)
    .filter(([key]) => this.guild.members.cache.has(key) || key == 'AI')
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOPLIST_MAX_USERS)
    .map(([key, value]) => '> ' + (key == 'AI' ? key : userMention(key)) + `: ${inlineCode(value)}`)
    .join('\n') || undefined;
}

/**
 * @param {number} input
 * @param {number} all
 * @throws {SyntaxError} If `all` is `NaN` */
function formatStatCount(input, all) {
  input = Number.parseInt(input);
  all = Number.parseInt(all);

  if (!Number.parseInt(input)) return inlineCode(0);
  if (!Number.parseInt(all) && all != 0) throw new SyntaxError(`arg all must be typeof Number (and not NaN)! Got "${typeof all}"`);

  return `${inlineCode(input)}${all ? '(' + inlineCode(Number.parseFloat((input / all * maxPercentage).toFixed(2)) + '%') + ')' : ''}`;
}

/** @type {command<'both'>} */
module.exports = {
  aliases: { prefix: ['leaderboard'], slash: ['leaderboard'] },
  cooldowns: { user: msInSecond },
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
          autocompleteOptions() { return Object.keys(this.client.db.get('leaderboards')); },
          strictAutocomplete: true
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
          autocompleteOptions() { return Object.keys(this.client.db.get('leaderboards')); },
          strictAutocomplete: true
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

  async run(lang) {
    if (this instanceof Message && !this.args[0]) return this.customReply(lang('missingGameArg'));

    const
      type = this.options?.getSubcommand() ?? 'user',
      target = getTargetMembers(this, { returnSelf: true }),
      settings = this.options?.getString('settings'),
      leaderboards = this.client.db.get('leaderboards'),
      [game, data] = Object.entries(leaderboards)
        .find(([k]) => k.toLowerCase() == (this.options?.getString('game', true) ?? this.args[0]).toLowerCase()) ?? [],
      [sort, mode] = this.options?.getString('sort')?.split('_') ?? [];

    if (!data) return this.customReply(lang('notFound', Object.keys(leaderboards).map(inlineCode).join(', ')));

    const embed = new EmbedBuilder({
      color: Colors.Blurple,
      footer: {
        text: this.member.user.tag,
        iconURL: this.member.displayAvatarURL()
      }
    });

    if (type == 'user') {
      embed.data.title = lang('embedTitle', { user: inlineCode(target.user.displayName), game });

      const targetData = data[target.id];
      if (targetData?.games > 0) {
        embed.data.description = `${lang('games', inlineCode(targetData.games))}\n\n`
          + `${lang('wins', formatStatCount(targetData.wins, targetData.games))}\n`
          + `${lang('draws', formatStatCount(targetData.draws, targetData.games))}\n`
          + `${lang('losses', formatStatCount(targetData.losses, targetData.games))}\n\n`;

        if (targetData.wonAgainst || targetData.lostAgainst || targetData.drewAgainst) embed.data.description += `${bold(lang('statsInfo'))}\n`;
        if (targetData.wonAgainst)
          embed.data.description += lang('wonAgainst') + '\n' + (manageData.call(this, targetData.wonAgainst) ?? '> ' + lang('noOne')) + '\n\n';
        if (targetData.lostAgainst)
          embed.data.description += lang('lostAgainst') + '\n' + (manageData.call(this, targetData.lostAgainst) ?? '> ' + lang('noOne')) + '\n\n';
        if (targetData.drewAgainst)
          embed.data.description += lang('drewAgainst') + '\n' + (manageData.call(this, targetData.drewAgainst) ?? '> ' + lang('noOne')) + '\n';
      }
      else {
        embed.data.description = target.id == this.member.id
          ? lang('youNoGamesPlayed', game)
          : lang('userNoGamesPlayed', { user: target.username, game });
      }

      return this.customReply({ embeds: [embed] });
    }

    await this.guild.members.fetch();

    embed.data.title = lang('embedTitleTop10', game);
    embed.data.description = formatTop.call(
      this, Object.entries(data).filter(e => settings == 'all_users' || this.guild.members.cache.has(e[0])),
      sort, mode, lang, embedDescriptionMaxLength
    ) ?? lang('noPlayers');

    const component = new ActionRowBuilder({
      components: [new StringSelectMenuBuilder({
        customId: `${getCommandName.call(this.client, this.command)}.${game}.sort.${settings}`,
        options: sortOptions.map(value => ({
          value, label: lang(`options.leaderboard.options.sort.choices.${value}`),
          default: value == (sort ? `${sort}_${mode}` : 'm_wins')
        }))
      })]
    });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};