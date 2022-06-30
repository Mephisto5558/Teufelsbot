const
  DBD = require('discord-dashboard'),
  DarkDashboard = require('dbd-dark-dashboard'),
  { readdirSync } = require('fs'),
  package = require('../package.json'),
  rateLimit = {
    windowMs: 15 * 60 * 1000, // 15min
    max: 100,
    message: '<body style="background-color:#000 color: #fff"><p>Sorry, you have been ratelimited!</p></body>',
    store: null
  }

async function getAllSettings(client) {
  const categoryOptionList = [];

  for (const subFolder of readdirSync('./Website/dashboard')) {
    const index = require(`../Website/dashboard/${subFolder}/_index.json`);
    const optionList = [{
      title: 'Important!',
      description: 'You need to press the submit button on the bottom of the page!',
      optionType: 'spacer',
      position: -1,
    }];

    if (index.id != 'config') {
      optionList.push({
        optionId: `${index.id}.enable`,
        optionName: 'Enable Module',
        optionDescription: 'Enable this Module',
        position: 0,
        optionType: DBD.formTypes.switch(),

        getActualSet: async ({ guild }) => {
          await client.db.get('settings')[guild.id]?.enabledModules?.includes(index.id);
        },
        setNew: async ({ newData }) => {
          const oldData = await client.db.get('settings');
          let guildData = oldData[guild.id];

          if (
            newData && guildData?.enabledModules?.includes(index.id) ||
            !newData && !guildData?.enabledModules?.includes(index.id)
          ) return true;

          else if (!newData) guildData.enabledModules = guildData.enabledModules.filter(e => e != index.id);
          else {
            if (!guildData) guildData = { enabledModules: [index.id] };
            else if (!guildData.enabledModules) guildData.enabledModules = [index.id];
            else guildData.enabledModules.push(index.id);
          }

          return client.db.set('settings', Object.assign({}, oldData, { [guild.id]: guildData }));
        }
      })
    }

    for (const file of readdirSync(`./Website/dashboard/${subFolder}`).filter(file => file.endsWith('.js'))) {
      const setting = require(`../Website/dashboard/${subFolder}/${file}`)(client);

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
          getActualSet: setting.get,
          setNew: setting.set,
          allowedCheck: setting.auth
        })
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

module.exports = async client => {
  const me = client.user || await client.users.fetch(client.userID);
  const domain = client.botType == 'main' ? `https://${package.name}.${package.author}.repl.co/` : 'http://localhost:8000';

  global.embedBuilder = (defaultSettings, themeOptions) => {
    return DBD.formTypes.embedBuilder(
      {
        username: defaultSettings?.username || me.username,
        avatarURL: defaultSettings?.avatarURL || me.displayAvatarURL(),
        defaultJson: defaultSettings?.defaultJSON || {}
      },
      themeOptions
    )
  }

  await DBD.useLicense(client.keys.dbdLicense);
  DBD.Dashboard = DBD.UpdatedClass();

  const Dashboard = new DBD.Dashboard({
    acceptPrivacyPolicy: true,
    useUnderMaintenance: false,
    minimizedConsoleLogs: client.botType == 'dev' ? false : true,
    port: 8000,
    domain: `${domain}/dashboard`,
    redirectUri: `${domain}/discord/callback`,
    bot: client,
    ownerIDs: [client.owner],
    client: {
      id: client.userID,
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
        createdBy: (await client.users.fetch(client.owner)).tag,
        iconURL: me.displayAvatarURL(),
        websiteTitle: `${me.username} | Dashboard`,
        websiteName: `${me.username} | Dashboard`,
        websiteUrl: `${domain}/dashboard`,
        dashboardUrl: `${domain}/dashboard`,
        supporteMail: 'mephisto5558@gmail.com',
        supportServer: 'https://discord.com/invite/u6xjqzz',
        imageFavicon: '../Website/favicon.ico',
        pageBackGround: 'linear-gradient(#2CA8FF, #155b8d)',
        preloader: 'Loading...',
        loggedIn: 'Successfully signed in.',
        mainColor: '#2CA8FF',
        subColor: '#ebdbdb'
      },
      index: {
        card: {
          category: "Teufelsbot Dashboard - The center of everything",
          title: 'Welcome to the Teufelsbot dashboard where you can control the features and settings of the bot.',
          description: 'Look up commands and configurate servers on the left side bar!',
          image: 'https://i.imgur.com/axnP93g.png'
        },
        information: {},
        feeds: {},
      },
      commands: [
        {
          category: "Starting Up",
          subTitle: "All helpful commands",
          aliasesDisabled: false,
          list: [
            {
              commandName: "bug",
              commandUsage: ";bug <bug>",
              commandDescription: "Report a bug to the developers of Wooar.",
              commandAlias: "No aliases"
            }
          ]
        },
      ],
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
    settings: await getAllSettings(client)
  });

  Dashboard.init();
}