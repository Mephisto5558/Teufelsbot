# Teufelsbot

[![Activity](https://img.shields.io/github/commit-activity/m/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/pulse)
[![License](https://img.shields.io/github/license/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/blob/main/LICENSE)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![wakatime](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot.svg)](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot)<br>
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql.yml/badge.svg)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql.yml)
[![ESLint](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Crowdin](https://badges.crowdin.net/teufelsbot/localized.svg)](https://crowdin.com/project/teufelsbot)<br>
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)<br>
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)


[![Discord Server](https://discordapp.com/api/guilds/725378451988676609/widget.png?style=shield)](https://discord.gg/u6xjqzz)

A discord.js v14 bot with Dashboard, multiple language support, a DB and many commands, in active development.<br>
I am very open for pull requests, feature requests and everything else that helps me improve.<br>
If you have any questions feel free to open an issue.<br>

[ToDo List](http://eu.pylex.me:20958/vote) | [Bot Invite Link](http://eu.pylex.me:20958/invite)

## Requirements
```
Node.js 18.17.0 or newer
MongoDB set up
```

## How to set it up
First, you clone the repository, by using `git clone https://github.com/Mephisto5558/Teufelsbot`.<br>
Then, you need to install the required npm packages by running `npm install` .<br>
Next, you need to create a `env.json` file. If you are hosting you bot code public, so everyone can see it, make sure they can't see this file or use a db in MongoDB. If you do this, you only need to set the MongoDB connection string as `dbConnectionStr` to process.env.<br>
The env file/collection needs to have all keys from the `env.json` from the Templates folder in order to work.<br>
You do not need to set the dev stuff, this is for development.<br>
Then, you can create a `config.json` file. The template is in the Templates folder. You can skip this part if you don't want to set any config. The file will be created automatically then.<br><br>
To run the Bot, run the `index.js` file.<br><br>
You should be ready to go!
<br>

# How to...
## ...add more languages and change translation texts
You can add changes on [Crowdin](https://de.crowdin.com/project/teufelsbot) or edit the language files in the `Locales` folder manually.

## ...add a new category
Create a new subfolder in the `Commands` folder. Name it how you want to name your category.<br>
Then, create a new file in `Locales/en/commands`. Name it `<category>.json` (Replace `<category>` with the lowercase name of the folder you created in `Commands`).<br>
Put this in the file:
```json
{
  "categoryName": <category name>
}
```
This name will be displayed in some places, such as the help command.

## ...add a new command
Create a js file in one of the subdirectories of the `Commands` directory. Paste in the `command.js` template (found in the `Templates` folder.)
Edit the properties. Many of them are optional so you could also remove them.<br>
Then, you need to add the texts to `Locales/en/commands`. Use the `command_translations.jsonc` template.

## Others
### Note to the sharp overwrite in package.json
The overwrite is required because sharp (which is a dependency of the fast-average-color-node package) and the canvas package are having compatibility issues on windows systems.<br>
See [node-canvas #930](https://github.com/Automattic/node-canvas/issues/930), [sharp #2548](https://github.com/lovell/sharp/issues/2548).
