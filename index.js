console.time('Initializing time');
console.info('Starting...');

Error.stackTraceLimit = 100;

const
  { Client, GatewayIntentBits, AllowedMentionsTypes, Partials, ActivityType } = require('discord.js'),
  { readdir } = require('node:fs/promises'),
  { WebServer } = require('@mephisto5558/bot-website'),
  { prototypeRegisterer: _, GiveawaysManager, configValidator: { validateConfig }, gitpull, errorHandler, getCommands, shellExec } = require('#Utils'),

  createClient = /** @returns {Client<false>}*/ () => new Client({
    shards: 'auto',
    failIfNotExists: false,
    allowedMentions: {
      parse: [
        AllowedMentionsTypes.User,
        AllowedMentionsTypes.Role
      ]
    },
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.Reaction
    ],
    presence: {
      activities: [{ name: '/help', type: ActivityType.Playing }]
    }
  });

/**
 * @this {Client<true>}
 * @param {Promise[]}handlerPromises
 * @param {string}message*/
async function processMessageEventCallback(handlerPromises, message) {
  if (message != 'Start WebServer') return;
  process.removeListener('message', processMessageEventCallback.bind(this, handlerPromises));

  if (this.config.disableWebserver) log('Webserver is disabled by config.json.');
  else {
    await Promise.all(handlerPromises);

    this.webServer ??= await new WebServer(
      this, this.db,
      { secret: this.keys.secret, dbdLicense: this.keys.dbdLicense },
      {
        domain: this.config.website.baseDomain, port: this.config.website.port,
        support: { discord: this.config.discordInvite, mail: this.config.mailAddress },
        webhookUrl: this.keys.votingWebhookURL,
        errorPagesDir: './Website/CustomSites/error', settingsPath: './Website/DashboardSettings', customPagesPath: './Website/CustomSites',
        ownerIds: [...this.config.devIds]
      }, errorHandler.bind(this)
    ).init(getCommands.call(this, this.i18n.__.bBind(this.i18n, { locale: 'en', undefinedNotFound: true })));
  }

  await require('./Handlers/event_handler.js').call(this);
  await require('./Events/ready.js').call(this); // Run due to it not being ran on ready, before the handler is loaded
}

console.timeEnd('Initializing time');
console.time('Starting time');

void (async function main() {
  if ((await gitpull()).message?.includes('Could not resolve host')) {
    log.error('It seems like the bot does not have internet access.');
    process.exit(1);
  }

  validateConfig();

  const client = createClient();
  await client.loadEnvAndDB();

  // WIP: client.backupSystem = new BackupSystem(client.db, { dbName: 'backups', maxGuildBackups: 5 });

  if (client.botType != 'dev') client.giveawaysManager = new GiveawaysManager(client);

  // Event handler gets loaded in {@link processMessageEventCallback} after the parent process exited to prevent duplicate code execution
  const handlerPromises = (await readdir('./Handlers')).filter(e => e != 'event_handler.js').map(handler => require(`./Handlers/${handler}`).call(client));
  handlerPromises.push(client.awaitReady().then(app => app.client.config.devIds.add(app.client.user.id).add(app.owner.owner?.id ?? app.owner.id)));

  await client.login(client.keys.token);
  log(`Logged into ${client.botType}`);

  if (process.connected) process.on('message', processMessageEventCallback.bind(client, handlerPromises));

  await Promise.all(handlerPromises);

  if (process.send?.('Finished starting') === false) {
    log.error('Could not tell the parent to kill itself. Exiting to prevent duplicate code execution.');
    process.exit(1);
  }

  if (!process.connected) await processMessageEventCallback.call(client, handlerPromises, 'Start WebServer');

  void client.db.update('botSettings', `startCount.${client.botType}`, (client.settings.startCount[client.botType] ?? 0) + 1);

  log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.\n`);
  console.timeEnd('Starting time');

  if (client.config.enableConsoleFix) {
    process.stdin.on('data', async buffer => {
      const { stdout, stderr } = await shellExec(buffer.toString().trim());
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.log(`stderr: ${stderr}`);
    });
  }

  process
    .on('unhandledRejection', err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => errorHandler.call(client, err))
    .on('uncaughtException', err => errorHandler.call(client, err));
})();