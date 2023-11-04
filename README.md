# Teufelsbot

[![Activity](https://img.shields.io/github/commit-activity/m/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/pulse)
[![License](https://img.shields.io/github/license/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/blob/main/LICENSE)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![wakatime](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot.svg)](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot)<br>
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml)
[![ESLint](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Crowdin](https://badges.crowdin.net/teufelsbot/localized.svg)](https://crowdin.com/project/teufelsbot)<br>
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)<br>
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)

[![Discord Server](https://discordapp.com/api/guilds/725378451988676609/widget.png?style=shield)](https://discord.gg/u6xjqzz)

A discord.js v14 bot with multiple features, in active development.<br>
I am very open for pull requests, feature requests and everything else that helps me improve.<br>
If you have any questions feel free to open an issue.<br>

[ToDo List](https://teufelsbot.repl.co/vote) | [Bot Invite Link](https://teufelsbot.repl.co/invite)<br>
## Requirements

```
Node.js 16.9.0 or newer
MongoDB set up
```
<br>

## How to set it up

First, you clone the repository, by using `git clone https://github.com/Mephisto5558/Teufelsbot`.<br>
Then, you need to install the required npm packages by running `npm install` .<br>
Next, you need to create a `env.json` file. If you are hosting you bot code public, so everyone can see it, make sure they can't see this file or use a db in MongoDB. If you do this, you only need to set the MongoDB connection string as `dbConnectionStr` to process.env.<br>
The env file/collection needs to have all keys from the `env.json` from the Templates folder in order to work.<br>
You do not need to set the dev stuff, this is for development.<br>
Then, you need to create a `config.json` file. The template is in the Templates folder.<br><br>
Then you have to [set up MongoDB](#how-to-set-up-mongodb).<br>
To run the Bot, you can run the `main.sh` or directly the `index.js` .<br><br>
You should be ready to go!

<br>

## How to set up MongoDB
As I made the DB its own NPM module you need to just put `await db.generate()` in index.js after `client.db ??= new DB`... You can remove the `await db.generate()` after it ran once.
This will generate all required objects from the `Templates\db_collections.json` file.

<br>

## How to add more languages and change texts

You can add changes on [Crowdin](https://de.crowdin.com/project/teufelsbot) or edit the language files in the `Locales` folder manually.
