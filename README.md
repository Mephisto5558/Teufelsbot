# Teufelsbot

[![Activity](https://img.shields.io/github/commit-activity/m/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/pulse)
[![License](https://img.shields.io/github/license/Mephisto5558/Teufelsbot)](https://github.com/Mephisto5558/Teufelsbot/blob/main/LICENSE)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=ncloc)](https://sonarcloud.io/component_measures?metric=ncloc&id=Mephisto5558_Teufelsbot)
[![wakatime](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot.svg)](https://wakatime.com/badge/github/Mephisto5558/Teufelsbot)<br>
[![CodeQL](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/github-code-scanning/codeql)
[![ESLint](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/Mephisto5558/Teufelsbot/actions/workflows/eslint.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Crowdin](https://badges.crowdin.net/teufelsbot/localized.svg)](https://crowdin.com/project/teufelsbot)<br>
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=security_rating)](https://sonarcloud.io/component_measures?metric=Security&id=Mephisto5558_Teufelsbot)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_rating)](https://sonarcloud.io/component_measures?metric=Maintainability&id=Mephisto5558_Teufelsbot)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=reliability_rating)](https://sonarcloud.io/component_measures?metric=Reliability&id=Mephisto5558_Teufelsbot)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=duplicated_lines_density)](https://sonarcloud.io/component_measures?metric=Duplications&id=Mephisto5558_Teufelsbot)<br>
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Mephisto5558_Teufelsbot&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Mephisto5558_Teufelsbot)

[![Discord Server](https://discord.com/api/guilds/1011956895529041950/widget.png?style=shield)](https://discord.com/invite/yWwGTeppjR)

A discord.js v14 bot with Dashboard, multiple language support, a DB and many commands, in active development.<br>
I am very open for pull requests, feature requests and everything else that helps me improve.<br>
If you have any questions feel free to open an issue.<br>

# [Add the bot to your server](http://us-la-01.wisp.uno:8006/invite)
[ToDo List](http://us-la-01.wisp.uno:8006/vote)

## Requirements
```
Node.js >=22.12.0
MongoDB set up
```

## How to set it up
1. Clone the repository, by using `git clone https://github.com/Mephisto5558/Teufelsbot`.
2. Install the required npm packages by running `npm install`.
3. Create a `.env` file. The template is in the `Templates` folder.<br>
Copy the contents of this template into your `.env` file and fill in the values.<br>
The bot will additionally load the file specified by the `environment` variable in the `.env` file (except when it's `main`). For example, if `environment=dev` is set in `.env`, the bot will load `.env.dev`.<br>
This allows for different configurations for different environments (e.g., development and production).<br>
4. Create a `config.json` file. The template is in the `Templates` folder. You can skip this part if you don't want to set any config. The file will be created automatically then.
5. To run the Bot, execute `node index.js`.

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