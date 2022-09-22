const
  DBD = require('discord-dashboard'),
  DarkDashboard = require('dbd-dark-dashboard'),
  { readdirSync } = require('fs'),
  { Support, Website } = require('../config.json'),
  I18nProvider = require('../Functions/private/I18nProvider.js'),
  lang = I18nProvider.__.bind(I18nProvider, { locale: 'en', undefinedNotFound: true }),
  rateLimit = {
    windowMs: 1 * 60 * 1000, // 1min
    max: 30,
    message: '<body style="background-color:#000 color: #ff0000"><p>Sorry, you have been ratelimited!</p></body>'
  }

async function getSettings() {
  const categoryOptionList = [];
  const guildSettings = this.db.get('guildSettings');

  for (const subFolder of getDirectoriesSync('./Website/dashboard')) {
    const index = require(`../Website/dashboard/${subFolder}/_index.json`);
    const optionList = [{
      title: 'Important!',
      description: 'You need to press the submit ButtonBuilder on the bottom of the page to save settings!',
      optionType: 'spacer',
      position: -1,
    }];

    this.dashboardOptionCount[index.id] = 0;

    if (index.id != 'config') {
      optionList.push({
        optionId: `${index.id}.enable`,
        optionName: 'Enable Module',
        optionDescription: 'Enable this Module',
        position: 0,
        optionType: DBD.formTypes.switch(),

        getActualSet: async ({ guild }) => guildSettings[guild.id]?.[index.id]?.enable,
        setNew: async ({ guild, newData }) => require('../Website/dashboard/saveSettings.js').call(this, guild.id, index.id, 'enable', newData),
      });
      this.dashboardOptionCount[index.id]++
    }

    for (const file of readdirSync(`./Website/dashboard/${subFolder}`).filter(e => e.endsWith('.js'))) {
      let setting = require(`../Website/dashboard/${subFolder}/${file}`);
      if (typeof setting == 'function') setting = setting.call(this);

      if (setting.type == 'spacer') {
        optionList.push({
          title: setting.name,
          description: setting.description,
          optionType: setting.type,
          position: setting.position
        })
      }
      else {
        if (typeof setting.type == 'function') setting.type = await setting.type.call(this);

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
          setNew: setting.set || (async ({ guild, newData }) => require('../Website/dashboard/saveSettings.js').call(this, guild.id, index.id, setting.id, newData)),
          allowedCheck: setting.auth
        });

        this.dashboardOptionCount[index.id]++
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

async function getCommands() {
  const categoryCommandList = [];

  for (const subFolder of getDirectoriesSync('./Commands')) {
    if (subFolder.toLowerCase() == 'owner-only') continue;
    const commandList = [];

    for (
      const cmd of readdirSync(`./Commands/${subFolder}`)
        .map(e => e.endsWith('.js') ? require(`../Commands/${subFolder}/${e}`) : null)
        .filter(e => e?.name && !e.hideInHelp && !e.disabled && (cmd.beta ? this.botType != 'dev' : true) && cmd.category.toLowerCase() != 'owner-only')
    ) {
      commandList.push({
        commandName: cmd.name,
        commandUsage:
          (cmd.slashCommand ? 'SLASH Command: Look at the option descriptions.\n' : '') +
          ((cmd.usage || lang(`commands.${subFolder}.${cmd.name}.usage`))?.replace(/slash command:/gi, '') ?? '') || 'No information found',
        commandDescription: cmd.description || lang(`commands.${subFolder}.${cmd.name}.description`) || 'No information found',
        commandAlias:
          (cmd.aliases.prefix.length ? `Prefix: ${cmd.aliases.prefix.join(', ')}\n` : '') +
          (cmd.aliases.slash.length ? `Slash: ${cmd.aliases.slash.join(', ')}` : '') || lang('global.none')
      });
    }

    categoryCommandList.push({
      category: subFolder,
      subTitle: '',
      aliasesDisabled: false,
      list: commandList.map(e => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v.trim().replaceAll('\n', '<br>&nbsp')])))
    });
  }

  return categoryCommandList.sort((a, b) => a.category.toLowerCase() == 'others' ? 1 : b.list.length - a.list.length);
}

async function getCustomPages(path = './Website/custom') {
  const pageList = [];
  const items = readdirSync(path, { withFileTypes: true }).filter(e => e.name.endsWith('.js') || e.isDirectory()).map(e => e.name);

  for (const folder of items.filter(e => !e.endsWith('.js'))) pageList.push(await getCustomPages.call(this, `${path}/${folder}`));

  for (const file of items.filter(e => e.endsWith('.js'))) {
    const site = require(`.${path}/${file}`);

    pageList.push(DBD.customPagesTypes[site.type](site.path, site.run));
  }

  return pageList;
}

module.exports = async function dashboardHandler() {
  await this.functions.ready();
  await DBD.useLicense(this.keys.dbdLicense);

  let domain;
  if (this.botType == 'main' && Website.Domain) domain = Website.Domain;
  else domain = (process.env.SERVER_IP ?? 'http://localhost') + ':' + (process.env.PORT ?? process.env.SERVER_PORT ?? 8000);

  if (!/^https?:\/\//.test(domain)) {
    if (Website.Domain) throw new Error('The Website.Domain specified in config.json is invalid! It needs to start with "http" or "https"!')
    domain = 'http://' + domain;
  }

  global.embedBuilder = DBD.formTypes.embedBuilder({
    username: this.user.username,
    avatarURL: this.user.displayAvatarURL({ forceStatic: true }),
    defaultJson: {}
  });

  const Dashboard = new (DBD.UpdatedClass())({
    acceptPrivacyPolicy: true,
    useUnderMaintenance: false,
    minimizedConsoleLogs: true,
    port: (process.env.PORT ?? process.env.SERVER_PORT ?? 8000),
    domain,
    redirectUri: `${domain}/discord/callback`,
    bot: this,
    ownerIDs: [this.application.owner.id],
    client: {
      id: this.user.id,
      secret: this.keys.secret
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
        createdBy: this.application.owner.tag,
        iconURL: this.user.displayAvatarURL(),
        websiteTitle: `${this.user.username} | Dashboard`,
        websiteName: `${this.user.username} | Dashboard`,
        websiteUrl: domain,
        dashboardUrl: domain,
        supporteMail: Support.Mail,
        supportServer: Support.Discord,
        imageFavicon: this.user.displayAvatarURL(),
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
      commands: await getCommands.call(this)
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
    settings: await getSettings.call(this),
    customPages: (await getCustomPages.call(this)).flat(Infinity)
  });

  Dashboard.init();
}
