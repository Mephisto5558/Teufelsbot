# Teufelsbot

[![Activity](https://img.shields.io/github/commit-activity/m/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/pulse)
[![License](https://img.shields.io/github/license/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/blob/main/LICENSE)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![wakatime](https://wakatime.com/badge/user/f9d04252-581b-43cf-8bc2-31351c68d2e6.svg)](https://wakatime.com/@f9d04252-581b-43cf-8bc2-31351c68d2e6)<br>
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml)
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)<br>
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)<br>
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)

[![Discord Server](https://discordapp.com/api/guilds/725378451988676609/widget.png?style=shield)](https://discord.gg/u6xjqzz)

A discord.js v14 bot with multiple features, in active developement.<br>
I am verry open for pull requests, feature requests and everything else that helps me improve.<br>
If you have any questions feel free to open an issue.<br>

[ToDo List](https://teufelsbot.repl.co/dev/todo)<br>
Hosted on [Fluid Nodes](https://fluidnodes.com)

## Requirements

```
Node.js 16.9.0 or newer
MongoDB set up
```

## How to set it up

First, you clone the repostry, by using `git clone https://github.com/Mephisto5558/Teufelsbot` .<br>
Then, you need to install the required npm packages by running `npm install` .<br>
Next, you need to create a `env.json` file. If you are hosting you bot code public, so everyone can see it, make sure they can't see this file or use a db in MongoDB. If you do this, you only need to set the MongoDB connection string as `dbConnectionStr` to process.env.<br>
The env file/collection needs to have all keys from the `_env.json` from the Templates folder in order to work.<br>
You do not need to set the dev stuff, this is for developement.<br>
Then, you need to create a `config.json` file. The template is in the Templates folder.<br><br>
Then you have to set up MongoDB.<br>
To run the Bot, you can run the `main.sh` or directly the `index.js` .<br><br>
You should be ready to go!

## How to set up MongoDB

You need to create a collection called "db-collections" and add the following documents with content:

<details>
  <summary>leaderboards</summary>

```json
  {
    "key": "leaderboards",
    "value": {}
  }
```

</details>
<details>
  <summary>giveaways</summary>

```json
    {
      "key": "giveaways",
      "value": []
    }
  ```

</details>
<details>
  <summary>botSettings (replace the values in env or delte env)</summary>

```json
{
  "key": "botSettings",
  "value": {
    "env": {
      "global": {
        "environment": "main",
        "keys": {
          "humorAPIKey": "api key for humor api (https:/humorapi.com)",
          "rapidAPIKey": "rapid api key (https:/rapidapi.com)",
          "githubKey": "github user key (used for /suggest, https://github.com/settings/tokens)",
          "FunFactAPI": "api key for fun fact api (https://api-ninjas.com/)",
          "WebsiteKey": "key to communicate with a external hosted dashboard"
        }
      },
      "main": {
        "dbConnectionStr": "mongoDB connection string",
        "keys": {
          "token": "discord bot token",
          "secret": "discord bot client secret"
        }
      },
      "dev": {
        "dbConnectionStr": "mongoDB connection string",
        "keys": {
          "token": "discord bot token",
          "secret": "discord bot client secret"
        }
      }
    },
    "blacklist": [],
    "patreonBonuses": {}
  }
}
```

</details>
<details>
  <summary>userSettings</summary>

```json
{
  "key": "userSettings",
  "value": {}
}
```

</details>
<details>
  <summary>guildSettings</summary>

```json
{
  "key": "guildSettings",
  "value": {
    "default": {
      "config": {
        "prefix": ".",
        "lang": "en"
      },
      "birthday": {
        "ch": {
          "msg": {
            "embed": {
              "title": "Happy birthday <user.nickname>",
              "description": "We hope you have a wonderful birthday.",
              "color": 39129
            }
          }
        },
        "dm": {
          "msg": {
            "embed": {
              "title": "Happy birthday!",
              "description": "Happy birthday to you! 🎉",
              "color": 39129
            }
          }
        }
      },
      "giveaway": {
        "reaction": "🎉",
        "embedColor": 3800852,
        "embedColorEnd": 16711680
      },
      "economy": {
        "currencyCapacity": 100,
        "config": {
          "gaining": {
            "chat": {
              "minMessageLength": 5,
              "maxMessageLength": 10000
            }
          }
        },
        "maxSlaves": 2,
        "maxConcurrentResearches": 3,
        "gaining": {
          "chat": 0.5,
          "voice": 0,
          "work": 0,
          "daily": 0
        },
        "skills": {
          "currency_bonus_percentage": {
            "percentage": 18,
            "lvlUpCooldown": 4.5,
            "firstPrice": 100
          },
          "currency_bonus_absolute": {
            "percentage": 18,
            "lvlUpCooldown": 210,
            "firstPrice": 1000
          },
          "research_speed_percentage": {
            "percentage": 18,
            "lvlUpCooldown": 840,
            "firstPrice": 100000
          },
          "research_bonus_percentage": {
            "percentage": 18,
            "lvlUpCooldown": 24,
            "firstPrice": 10000
          },
          "power": {
            "percentage": 18,
            "lvlUpCooldown": 24,
            "firstPrice": 250
          },
          "defense": {
            "percentage": 18,
            "lvlUpCooldown": 12,
            "firstPrice": 100
          },
          "currency_capacity": {
            "percentage": 18,
            "lvlUpCooldown": 48,
            "firstPrice": 100
          },
          "slave_capacity": {
            "percentage": 18,
            "lvlUpCooldown": 168,
            "firstPrice": 1000000
          }
        }
      }
    }
  }
}
```

</details>
<details>
  <summary>polls</summary>

```json
{
  "key": "polls",
  "value": {}
}
```

</details>

## How to add more languages

Go to the Locales folder and duplicate the "en" folder. Rename it to the language code you want to use (eg. "de" for German) and edit the json files.<br>
It gets loaded automatically on startup and will fallback to english if something is not provided.
