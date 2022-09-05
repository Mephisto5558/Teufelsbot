# Teufelsbot
[![Activity](https://img.shields.io/github/commit-activity/m/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/pulse)
[![License](https://img.shields.io/github/license/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/blob/main/LICENSE)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![wakatime](https://wakatime.com/badge/user/f9d04252-581b-43cf-8bc2-31351c68d2e6.svg)](https://wakatime.com/@f9d04252-581b-43cf-8bc2-31351c68d2e6)<br>
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/codeql-analysis.yml)
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
I am verry open for pull requests, feature requests and everything else that helps me improve.

[ToDo List](https://teufelsbot.mephisto5558.repl.co/dev/todo)<br>
Hosted on [replit.com](https://replit.com)

## Requirements
```
Node.js 16.9.0 or newer
```

## How to set it up
First, you clone the repostry, by using `git clone https://github.com/Mephisto5558/Teufelsbot`.<br>
Then, you need to install the required npm packages by running `npm install`.<br>
Next, you need to create a `env.json` file. If you are hosting you bot code public, so everyone can see it, make sure they can't see this file or use a db in mongoDB. If you do this, you only need to set the mongoDB connection string as `dbConnectionStr` to process.env.<br>
The env file/collection needs to have all keys from the `_env.json` from the template folder in order to work.<br>
You do not need to set the dev stuff, this is for developement.<br>
Then, you need to create a `config.json` file. The template is in the template folder.<br><br>
You will have to setup the mongodb, i will write how to soon.
To run the Bot, you can run the `main.sh` or directly the `index.js`.<br><br>
You should be ready to go!
