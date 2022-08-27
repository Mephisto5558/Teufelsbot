const
  DBD = require('discord-dashboard'),
  DarkDashboard = require('dbd-dark-dashboard'),
  { readdirSync } = require('fs'),
  { Support, Website } = require('../config.json'),
  rateLimit = {
    windowMs: 1 * 60 * 1000, // 1min
    max: 30,
    message: '<body style="background-color:#000 color: #ff0000"><p>Sorry, you have been ratelimited!</p></body>'
  }

async function getSettings(client) {
  const categoryOptionList = [];
  const guildSettings = client.db.get('guildSettings');

  for (const subFolder of getDirectoriesSync('./Website/dashboard')) {
    const index = require(`../Website/dashboard/${subFolder}/_index.json`);
    const optionList = [{
      title: 'Important!',
      description: 'You need to press the submit ButtonBuilder on the bottom of the page to save settings!',
      optionType: 'spacer',
      position: -1,
    }];

    client.dashboardOptionCount[index.id] = 0;

    if (index.id != 'config') {
      optionList.push({
        optionId: `${index.id}.enable`,
        optionName: 'Enable Module',
        optionDescription: 'Enable this Module',
        position: 0,
        optionType: DBD.formTypes.switch(),

        getActualSet: async ({ guild }) => guildSettings[guild.id]?.[index.id]?.enable,
        setNew: async ({ guild, newData }) => require('../Website/dashboard/saveSettings.js')(client, guild.id, index.id, 'enable', newData),
      });
      client.dashboardOptionCount[index.id]++
    }

    for (const file of readdirSync(`./Website/dashboard/${subFolder}`).filter(e => e.endsWith('.js'))) {
      let setting = require(`../Website/dashboard/${subFolder}/${file}`);
      if (typeof setting == 'function') setting = setting(client);

      if (setting.type == 'spacer') {
        optionList.push({
          title: setting.name,
          description: setting.description,
          optionType: setting.type,
          position: setting.position
        })
      }
      else {
        if (typeof setting.type == 'function') setting.type = await setting.type(client);

        optionList.push({
          optionId: `${index.id}.${setting.id}`,
          optionName: setting.name,
          optionDescription: setting.description,
          position: setting.position,
          optionType: setting.type,
          getActualSet: setting.get || (async ({ guild }) => {
            let gSetting = guildSettings[guild.id]?.[index.id] || guildSettings.default?.[index.id];
            const items = setting.id.replace(/([A-Z])/g, r => `.${r.toLowerCase()}`).split('.');

            for (const entry of items) gSetting = gSetting?.[entry];
            if (!gSetting) {
              gSetting = guildSettings.default?.[index.id];
              for (const entry of items) gSetting = gSetting?.[entry];
            }

            return gSetting;
          }),
          setNew: setting.set || (async ({ guild, newData }) => require('../Website/dashboard/saveSettings.js')(client, guild.id, index.id, setting.id, newData)),
          allowedCheck: setting.auth
        });

        client.dashboardOptionCount[index.id]++
      }
    }

    categoryOptionList.push({
      categoryId: index.id,
      categoryName: index.name,
      position: index.position,
      categoryDescription: index.description,
      categoryOptionsList: optionList.sort((a, b) => a.position - b.position)
    })
  }

  return categoryOptionList.sort((a, b) => a.position - b.position);
}

async function getCommands(client) {
  const categoryCommandList = [];

  for (const subFolder of getDirectoriesSync('./Commands')) {
    if (subFolder.toLowerCase() == 'owner-only') continue;
    const commandList = [];

    for (const file of readdirSync(`./Commands/${subFolder}`).filter(e => e.endsWith('.js'))) {
      const cmd = require(`../Commands/${subFolder}/${file}`);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || (cmd.beta && client.botType != 'dev') || cmd.category.toLowerCase() == 'owner-only') continue;

      commandList.push({
        commandName: cmd.name,
        commandUsage:
          (cmd.slashCommand ? 'SLASH Command: Look at the option descriptions.\n' : '') +
          (cmd.usage?.replace(/slash command:/gi, '') ?? '') || 'No information found',
        commandDescription: cmd.description || 'No information found',
        commandAlias:
          (cmd.aliases.prefix.length ? `Prefix: ${cmd.aliases.prefix.join(', ')}\n` : '') +
          (cmd.aliases.slash.length ? `Slash: ${cmd.aliases.slash.join(', ')}` : '') || 'none'
      })
    }

    categoryCommandList.push({
      category: subFolder,
      subTitle: '',
      aliasesDisabled: false,
      list: commandList.map(e => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v.trim().replace(/\n/g, '<br>&nbsp')])))
    })
  }

  return categoryCommandList.sort((a, b) => a.category.toLowerCase() == 'others' ? 1 : b.list.length - a.list.length);
}

async function getCustomPages(client, path = './Website/custom') {
  const pageList = [];
  const items = readdirSync(path, { withFileTypes: true }).filter(e => e.name.endsWith('.js') || e.isDirectory()).map(e => e.name);

  for (const folder of items.filter(e => !e.endsWith('.js'))) pageList.push(await getCustomPages(client, `${path}/${folder}`));

  for (const file of items.filter(e => e.endsWith('.js'))) {
    const site = require(`.${path}/${file}`);

    pageList.push(DBD.customPagesTypes[site.type](site.path, site.run));
  }

  return pageList;
}

module.exports = async client => {
  await client.functions.ready(client);
  await DBD.useLicense(client.keys.dbdLicense);

  let domain;
  if (client.botType == 'main' && Website.Domain) domain = Website.Domain;
  else domain = (process.env.SERVER_IP ?? 'http://localhost') + ':' + (process.env.PORT ?? process.env.SERVER_PORT ?? 8000);

  if (!/^https?:\/\//.test(domain)) {
    if (Website.Domain) throw new Error('The Website.Domain specified in config.json is invalid! It needs to start with "http" or "https"!')
    domain = 'http://' + domain;
  }

  global.embedBuilder = DBD.formTypes.embedBuilder({
    username: client.user.username,
    avatarURL: client.user.displayAvatarURL(),
    defaultJson: {}
  });

  const Dashboard = new (DBD.UpdatedClass())({
    acceptPrivacyPolicy: true,
    useUnderMaintenance: false,
    minimizedConsoleLogs: true,
    port: (process.env.PORT ?? process.env.SERVER_PORT ?? 8000),
    domain,
    redirectUri: `${domain}/discord/callback`,
    bot: client,
    ownerIDs: [client.application.owner.id],
    client: {
      id: client.user.id,
      secret: client.keys.secret
    },
    invite: {
      scopes: ['bot', 'applications.commands'],
      permissions: '412317240384'
    },
    rateLimits: {
      manage: rateLimit,
      guildPage: rateLimit,
      settingsUpdatePostAPI: rateLimit,
      discordOAuth2: rateLimit
    },
    theme: DarkDashboard({
      information: {
        createdBy: client.application.owner.tag,
        iconURL: client.user.displayAvatarURL(),
        websiteTitle: `${client.user.username} | Dashboard`,
        websiteName: `${client.user.username} | Dashboard`,
        websiteUrl: domain,
        dashboardUrl: domain,
        supporteMail: Support.Mail,
        supportServer: Support.Discord,
        imageFavicon: client.user.displayAvatarURL(),
        pageBackGround: 'linear-gradient(#2CA8FF, #155b8d)',
        preloader: 'Loading...',
        loggedIn: 'Successfully signed in.',
        mainColor: '#2CA8FF',
        subColor: '#ebdbdb'
      },
      index: {
        card: {
          category: 'Teufelsbot Dashboard - The center of everything',
          title: 'Welcome to the Teufelsbot dashboard where you can control the features and settings of the bot.',
          description: 'Look up commands and configurate servers on the left side bar!',
          image: 'https://i.imgur.com/axnP93g.png'
        },
        information: {},
        feeds: {},
      },
      commands: await getCommands(client)
    }),
    underMaintenance: {
      title: 'Under Maintenance',
      contentTitle: '<p id="content-title" style="color: #ddd9d9">This page is under maintenance</p>',
      texts: [
        '<br><p class="text" style="color: #ddd9d9">' +
        'We still want to change for the better for you.<br>' +
        'Therefore, we are introducing technical updates so that we can allow you to enjoy the quality of our services.' +
        '<br></p><br>'
      ],
      bodyBackgroundColors: ['#999', '#0f173d'],
      buildingsColor: '#6a6a6a',
      craneDivBorderColor: '#6a6a6a',
      craneArmColor: '#8b8b8b',
      craneWeightColor: '#8b8b8b',
      outerCraneColor: '#6a6a6a',
      craneLineColor: '#6a6a6a',
      craneCabinColor: '#8b8b8b',
      craneStandColors: ['#6a6a6a', , '#f29b8b']
    },
    settings: await getSettings(client),
    customPages: (await getCustomPages(client)).flat(Infinity)
  });

  Dashboard.init();
}
