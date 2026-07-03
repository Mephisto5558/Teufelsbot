/* eslint-disable-next-line n/no-unpublished-import -- this is a dev file */
import config, { getModifiedRule, jsGlob, pluginNames, tsGlob } from '@mephisto5558/eslint-config';

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
    files: [`**/*${tsGlob}`, `**/*${jsGlob}`],
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
    files: [`./src/website/dashboardSettings/**/*${jsGlob}`, `./src/website/dashboardSettings/**/*${tsGlob}`],
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
    name: 'overwrite:tests',
    files: [`./tests/**/*${jsGlob}`],
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