#!/usr/bin/env node

console.time('Initializing time');
console.info('Starting...');

const maxStackTraceLimit = 100;
Error.stackTraceLimit = maxStackTraceLimit;

const
  { ActivityType, AllowedMentionsTypes, Client, GatewayIntentBits, Partials, Team } = require('discord.js'),
  { WebServer } = require('@mephisto5558/bot-website'),
  {
    GiveawaysManager, configValidator: { configValidationLoop },
    gitpull, errorHandler, getCommands, shellExec /* , BackupSystem */
  } = require('#Utils'),
  events = require('./Events'),
  handlers = require('./Handlers'),
  /* eslint-disable-next-line custom/unbound-method -- fine here */
  { onTick: syncEmojis } = require('./TimeEvents').syncEmojis,

  createClient = /** @returns {Client<false>} */ () => new Client({
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
 * @param {Promise[]} handlerPromises
 * @param {string} message */
async function processMessageEventCallback(handlerPromises, message) {
  if (message != 'Start WebServer') return;
  process.removeListener('message', processMessageEventCallback.bind(this, handlerPromises));

  if (this.config.disableWebserver) log('Webserver is disabled by config.json.');
  else {
    await Promise.all(handlerPromises);

    this.webServer ??= await new WebServer(
      this, this.db,
      { secret: process.env.secret, dbdLicense: process.env.dbdLicense },
      {
        domain: this.config.website.domain, port: this.config.website.port,
        support: { discord: this.config.discordInvite, mail: this.config.mailAddress },
        webhookUrl: process.env.votingWebhookURL,
        errorPagesDir: './Website/CustomSites/error', settingsPath: './Website/DashboardSettings', customPagesPath: './Website/CustomSites',
        ownerIds: [...this.config.devIds], defaultAPIVersion: 1
      }, errorHandler.bind(this)
    ).init(
      {},
      { commands: getCommands.call(this, this.i18n.getTranslator({ locale: 'en', undefinedNotFound: true })) },
      { votingPath: this.config.website.vote }
    );
  }

  handlers.eventHandler.call(this);
  await events.clientReady.call(this); // run due to it not being ran on clientReady, before the handler is loaded
}

/**
 * @this {Client<false>}
 * @param {string} token
 * @returns {Promise<Client<true>>} */
async function loginClient(token) {
  await this.login(token);
  log(`Logged into ${this.botType}`);

  return this;
}

console.timeEnd('Initializing time');
console.time('Starting time');

void (async function main() {
  if ((await gitpull()).message.includes('Could not resolve host')) {
    log.error('It seems like the bot does not have internet access.');
    process.exit(1);
  }

  configValidationLoop();

  const newClient = createClient();
  await newClient.loadEnvAndDB();
  await newClient.i18n.init();

  await syncEmojis.call(newClient);

  // WIP: newClient.backupSystem = new BackupSystem(newClient.db, { dbName: 'backups' });

  if (newClient.botType != 'dev') newClient.giveawaysManager = new GiveawaysManager(newClient);

  /** Event handler gets loaded in {@link processMessageEventCallback} after the parent process exited to prevent duplicate code execution */
  const
    handlerPromises = [
      ...Object.entries(handlers).filter(([k]) => k != 'eventHandler').map(async ([,handler]) => handler.call(newClient)),
      newClient.awaitReady().then(app => app.client.config.devIds.add((app.owner instanceof Team ? app.owner.owner : app.owner)?.id))
    ],

    client = await loginClient.call(newClient, process.env.token);

  if (process.connected) process.on('message', processMessageEventCallback.bind(client, handlerPromises));

  await Promise.all(handlerPromises);

  if (process.send?.('Finished starting') === false) {
    log.error('Could not tell the parent to kill itself. Exiting to prevent duplicate code execution.');
    process.exit(1);
  }

  if (!process.connected) await processMessageEventCallback.call(client, handlerPromises, 'Start WebServer');

  void client.db.update('botSettings', `startCount.${client.botType}`, (client.settings.startCount[client.botType] ?? 0) + 1);

  log(
    `Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers `
    + `in ${client.i18n.availableLocales.size} languages.\n`
  );
  console.timeEnd('Starting time');

  if (client.config.enableConsoleFix) {
    process.stdin.on('data', async buffer => {
      try {
        const { stdout, stderr } = await shellExec(buffer.toString().trim());
        if (stdout) console.log(`stdout: ${stdout}`);
        if (stderr) console.log(`stderr: ${stderr}`);
      }
      catch (err) {
        console.log(`Error: ${JSON.stringify(err)}`);
      }
    });
  }

  process
    .on('unhandledRejection', async err => errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', async err => errorHandler.call(client, err))
    .on('uncaughtException', async err => errorHandler.call(client, err));
})();