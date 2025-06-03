const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js'),
  { msInSecond, secsInWeek } = require('#Utils').timeFormatter;

module.exports = {
  time: '00 00 00 * * 1',
  startNow: false,

  /** @this {Client} */
  async onTick() {
    const now = new Date();

    if (!this.config.website.domain) return void log.warn('Voting reminder did not run due to no domain being configured in config.json');
    if (this.settings.timeEvents.lastVotingReminder?.toDateString() == now.toDateString()) return void log('Already sent voting reminders this week');

    const
      today = new Date().setHours(0, 0, 0),
      lang = this.i18n.__.bBind(this.i18n, { backupPath: ['others.timeEvents.votingReminder'] }),
      embed = new EmbedBuilder({ color: Colors.White }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            style: ButtonStyle.Link,
            url: `${this.config.website.domain}/vote`
          }),
          new ButtonBuilder({
            style: ButtonStyle.Danger,
            customId: 'votingReminder.disable'
          })
        ]
      }),
      users = Object.entries(this.db.get('userSettings')).filter(([, e]) => !e.votingReminderDisabled && e.lastVoted > today - msInSecond * secsInWeek * 2);

    log('Started sending voting reminders').debug('Started sending voting reminders');

    let /** @type {import('discord.js').User | undefined} */user; // required for typing
    for ({ value: user } of await Promise.allSettled(users.map(e => this.users.fetch(e[0])))) {
      if (!user) continue;

      lang.__boundArgs__[0].locale = user.localeCode;

      embed.data.title = lang('embedTitle');
      embed.data.description = lang('embedDescription');
      embed.data.footer = { text: lang('embedFooterText') };
      embed.setTimestamp(user.db.lastVoted);

      component.components[0].data.label = lang('buttonLabelVote');
      component.components[1].data.label = lang('buttonLabelDisable');

      await user.send({ embeds: [embed], components: [component], flags: MessageFlags.SuppressNotifications }).catch(() => { /* empty */ });
    }

    await this.db.update('botSettings', 'timeEvents.lastVotingReminder', now);

    log('Finished sending voting reminders').debug('Finished sending voting reminders');
  }
};