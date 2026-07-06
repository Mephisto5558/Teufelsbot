console.time('Initializing time');
console.info('Starting...');

const maxStackTraceLimit = 100;
Error.stackTraceLimit = maxStackTraceLimit;

/* eslint-disable import-x/first -- intentional */
import { ActivityType, AllowedMentionsTypes, Client, GatewayIntentBits, Partials, Team } from 'discord.js';
import { WebServer } from '@mephisto5558/bot-website';
import { getCommands } from '@mephisto5558/command';
import {
  GiveawaysManager, commandPermissionCheck, configValidator, errorHandler, gitpull, shellExec, /* , BackupSystem */ updateCommandStats
} from '#utils';
import events from './events/index.js';
import handlers from './handlers/index.ts';
import timeEvents from './timeEvents/index.ts';
/* eslint-enable import-x/first */

const
  { configValidationLoop } = configValidator,
  /* eslint-disable-next-line custom/unbound-method -- gets re-bound */
  { onTick: syncEmojis } = timeEvents.syncEmojis,

  createClient = (): Client<false> => new Client({
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

async function loginClient(this: Client<false>, token: string): Promise<Client<true>> {
  await this.login(token);
  log(`Logged into ${this.botType}`);

  return this as unknown as Client<true>;
}

console.timeEnd('Initializing time');
console.time('Starting time');


if ((await gitpull()).message.includes('Could not resolve host')) {
  console.error('It seems like the bot does not have internet access.');
  process.exit(1);
}

configValidationLoop();

const newClient = createClient();
await newClient.loadEnvAndDB();
await newClient.i18n.init();

await syncEmojis.call(newClient);

// WIP: newClient.backupSystem = new BackupSystem(newClient.db, { dbName: 'backups' });

if (newClient.botType != 'dev') newClient.giveawaysManager = new GiveawaysManager(newClient);

const [client] = await Promise.all([
  loginClient.call(newClient, process.env.token),
  /* eslint-disable-next-line @typescript-eslint/require-await -- some handlers are async */
  ...Object.entries({ ...handlers }).map(async ([,handler]) => handler.call(newClient)),
  newClient.awaitReady().then(app => app.client.config.devIds.add((app.owner instanceof Team ? app.owner : app).owner?.id)),
  newClient.awaitReady().then(async () => newClient.commandManager.init('./Commands', newClient, newClient.i18n, {
    logger: log,
    doneFn: updateCommandStats,
    cooldownsManager: newClient.cooldowns,
    devIds: newClient.config.devIds,
    devOnlyCategories: new Set(newClient.config.devOnlyFolders),
    runBetaCommandsOnly: newClient.botType == 'dev',
    replyOn: {
      disabled: newClient.config.replyOnDisabledCommand,
      nonBeta: newClient.config.replyOnNonBetaCommand
    },
    customPermissionChecks: commandPermissionCheck,
    messagePrefixesArePreRemoved: true
  }))
]);

if (newClient.config.disableCommands) log('Command handling is disabled by config.json.');
else await newClient.commandManager.loadAll();

if (client.config.disableWebserver) log('Webserver is disabled by config.json.');
else {
  /* eslint-disable-next-line require-atomic-updates -- webServer will not exist */
  client.webServer = await new WebServer(
    client, client.db,
    { secret: process.env.secret, dbdLicense: process.env.dbdLicense },
    {
      domain: client.config.website.domain, port: client.config.website.port,
      support: { discord: client.config.discordInvite, mail: client.config.mailAddress },
      webhookUrl: process.env.votingWebhookURL,
      errorPagesDir: './website/customSites/error', settingsPath: './website/dashboardSettings', customPagesPath: './website/customSites',
      ownerIds: [...client.config.devIds], autoApproveOwnerRequests: true, defaultAPIVersion: 1
    }, errorHandler.bind(client)
  ).init(
    {},
    {
      commands: getCommands.call(
        client, client.i18n.getTranslator({ locale: 'en', undefinedNotFound: true }),
        client.commandManager.commands.map(e => e.command)
      )
    },
    { votingPath: client.config.website.vote }
  );
}

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