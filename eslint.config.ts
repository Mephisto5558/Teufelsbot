/* eslint-disable-next-line import-x/no-extraneous-dependencies -- this is a dev file */
import config, { allFilesGlob, getModifiedRule, jsGlob, pluginNames, tsGlob } from '@mephisto5558/eslint-config';

const gitignoreConfig = config.find(e => e.name == 'eslint-config:cwd-gitignore');
if (gitignoreConfig?.ignores) {
  // git-ignored but still linted
  gitignoreConfig.ignores = gitignoreConfig.ignores.filter(e => e != 'src/website/customSites/tw');
}

export default [
  ...config,
  {
    ignores: ['./Locales/!(en)/**', '**/utils/DiscordAPIErrorCodes.json']
  },
  {
    name: 'templates',
    files: [`templates/*${tsGlob}`, `templates/*${jsGlob}`],
    rules: {
      [`${pluginNames.typescript}/no-empty-function`]: 'off',
      [`${pluginNames.typescript}/no-unused-vars`]: 'off'
    }
  },
  {
    name: 'overwrite:scripts',
    files: [`${allFilesGlob}${tsGlob}`, `${allFilesGlob}${jsGlob}`],
    languageOptions: {
      globals: {
        log: 'readonly',

        // [TYPES] see globals.d.ts
        Database: 'writable',
        lang: 'writable',
        Client: 'writable',
        Message: 'writable',
        PartialMessage: 'writable',
        Interaction: 'writable',
        GuildInteraction: 'writable',
        DMInteraction: 'writable'
      }
    },
    rules: {
      ...getModifiedRule(config, 'no-underscore-dangle', [{
        allow: [
          '__count__', // Object#count
          '_log', '_logToConsole', '_logToFile' // Logger
        ]
      }]),
      ...getModifiedRule(config, `${pluginNames.unicorn}/filename-case`, [{
        ignore: [
          '[^_]+_{1,2}[^_]+', // allow one single or double underscore within the filename
          '^[A-Z].*' // allow starting with an uppercase letter for class exports
        ]
      }]),
      [`${pluginNames.unicorn}/prefer-module`]: 'off',
      [`${pluginNames.unicorn}/prefer-top-level-await`]: 'off'
    }
  },
  {
    name: 'overwrite:commands',
    files: [`./src/commands/${allFilesGlob}${tsGlob}`],
    rules: {
      [`${pluginNames.typescript}/explicit-function-return-type`]: [
        'warn', {
          /* eslint-disable id-length -- depends on the plugin */
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: true,
          /* eslint-enable id-length  */
          allowExpressions: false,
          allowFunctionsWithoutTypeParameters: false,
          allowHigherOrderFunctions: true,
          allowIIFEs: false,
          allowTypedFunctionExpressions: true,
          allowedNames: ['autocompleteOptions', 'run']
        }
      ]
    }
  },
  {
    name: 'overwrite:locales/commands',
    files: ['./locales/*/commands/*.json'],
    rules: {
      ...getModifiedRule(config, `${pluginNames.jsonc}/key-name-casing`, [{
        snake_case: true /* eslint-disable-line camelcase -- snake_case is not camelCase */
      }]),
      ...getModifiedRule(config, `${pluginNames.jsonc}/sort-keys`, [
        {
          pathPattern: '^$',
          order: [
            'categoryName',
            'categoryDescription',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: '^(?!categoryName|categoryDescription).+$',
          order: [
            'description',
            'usage',
            'options',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: String.raw`^(?!categoryName|categoryDescription).+\.options.*$`,
          order: [
            'description',
            'options',
            'choices',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: String.raw`.*\.usage$`,
          order: [
            'usage',
            'examples'
          ]
        }
      ])
    }
  },
  {
    name: 'overwrite:dashboard-settings',
    files: [`./src/website/dashboardSettings/${allFilesGlob}${jsGlob}`, `./src/website/dashboardSettings/${allFilesGlob}${tsGlob}`],
    rules: {
      ...getModifiedRule(config, `${pluginNames.typescript}/no-magic-numbers`, [{
        detectObjects: false // allow `position` filed
      }])
    }
  },
  {
    name: 'overwrite:dashboard-settings-index',
    files: ['./src/website/dashboardSettings/*/_index.json'],
    rules: {
      ...getModifiedRule(config, `${pluginNames.jsonc}/sort-keys`, [{
        pathPattern: '^$',
        order: [
          'id',
          'name',
          'description',
          'position',
          { order: { type: 'asc' } }
        ]
      }])
    }
  },
  {
    name: 'overwrite:customSites',
    files: [`./src/website/customSites/${allFilesGlob}`],
    rules: {
      [`${pluginNames.unicorn}/filename-case`]: 'off' // file names represent route names
    }
  },
  {
    name: 'overwrite:tests',
    files: [`./tests/${allFilesGlob}${jsGlob}`, `./tests/${allFilesGlob}${tsGlob}`],
    rules: {
      ...getModifiedRule(config, 'id-length', [{
        exceptions: ['t']
      }]),
      [`${pluginNames.typescript}/no-magic-numbers`]: 'off',
      [`${pluginNames.unicorn}/no-null`]: 'off',
      [`${pluginNames.node}/no-top-level-await`]: 'off'
    }
  }
] as typeof config;