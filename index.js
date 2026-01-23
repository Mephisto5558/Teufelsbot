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
      activities: [{ name: 'Starting...', type: ActivityType.Custom }]
    }
  });

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

  if (newClient.config.disableCommands) log('Command handling is disabled by config.json.');

  await Promise.all([
    ...Object.entries(handlers)
      .filter(([k]) => !(newClient.config.disableCommands ? ['commandHandler', 'slashCommandHandler'] : []).includes(k))
      .map(async ([,handler]) => handler.call(newClient)),
    newClient.awaitReady().then(app => app.client.config.devIds.add((app.owner instanceof Team ? app.owner.owner : app.owner)?.id))
  ]);

  const client = await loginClient.call(newClient, process.env.token);

  if (client.config.disableWebserver) log('Webserver is disabled by config.json.');
  else {
    /* eslint-disable-next-line require-atomic-updates */
    client.webServer = await new WebServer(
      client, client.db,
      { secret: process.env.secret, dbdLicense: process.env.dbdLicense },
      {
        domain: client.config.website.domain, port: client.config.website.port,
        support: { discord: client.config.discordInvite, mail: client.config.mailAddress },
        webhookUrl: process.env.votingWebhookURL,
        errorPagesDir: './Website/CustomSites/error', settingsPath: './Website/DashboardSettings', customPagesPath: './Website/CustomSites',
        ownerIds: [...client.config.devIds], autoApproveOwnerRequests: true, defaultAPIVersion: 1
      }, errorHandler.bind(client)
    ).init(
      {},
      { commands: getCommands.call(client, client.i18n.getTranslator({ locale: 'en', undefinedNotFound: true })) },
      { votingPath: client.config.website.vote }
    );
  }

  handlers.eventHandler.call(client);
  await events.clientReady.call(client); // run due to it not being ran on clientReady, before the handler is loaded

  void client.db.update('botSettings', `startCount.${client.botType}`, (client.settings.startCount[client.botType] ?? 0) + 1);

  log(
    `Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers `
    + `in ${client.i18n.availableLocales.size} languages.\n`
  );
  console.timeEnd('Starting time');

  if (client.config.enableConsoleFix) {
    /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
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
    .on('unhandledRejection', err => void errorHandler.call(client, err))
    .on('uncaughtExceptionMonitor', err => void errorHandler.call(client, err))
    .on('uncaughtException', err => void errorHandler.call(client, err));
})();