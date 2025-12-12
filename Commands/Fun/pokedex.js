/**
 * @import * as PokedexT from 'pokedex-promise-v2'
 * @import { Locale } from '@mephisto5558/i18n' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, bold, inlineCode } = require('discord.js'),

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the lib does not document CommonJS imports */
  /** @type {typeof PokedexT} */ Pokedex = require('pokedex-promise-v2').default,
  { maxPercentage } = require('#Utils').constants,


  DM_TO_CM = 10,
  DM_TO_M = .1,
  HG_TO_G = 100, // Hectogram
  HG_TO_KG = .1,
  GENDER_RATE = 8, // See https://pokeapi.co/docs/v2#pokemonspeciesgender
  pokedex = new Pokedex(),

  /* eslint-disable-next-line jsdoc/no-undefined-types -- false positive */
  /** @type {<T extends string>(str: T) => Capitalize<T>} */
  capitalize = str => str[0].toUpperCase() + str.slice(1);

/** @type {Awaited<ReturnType<typeof getGenderMap>> | undefined} */
let genderMap;

async function getGenderMap() {
  /** @type {Record<string, Record<string, `${number}%`>>} */
  const species = {};

  for (const gender of await pokedex.getGenderByName((await pokedex.getGendersList()).results.map(e => e.name))) {
    for (const pokemon of gender.pokemon_species_details) {
      species[pokemon.pokemon_species.name] ??= {};

      let percentage;
      if (gender.name == 'genderless') percentage = maxPercentage;
      else if (gender.name == 'female') percentage = (pokemon.rate / GENDER_RATE) * maxPercentage;
      else percentage = ((GENDER_RATE - pokemon.rate) / GENDER_RATE) * maxPercentage;

      if (percentage == maxPercentage) species[pokemon.pokemon_species.name] = gender.name;
      else species[pokemon.pokemon_species.name][gender.name] = `${percentage}%`;
    }
  }

  return species;
}

/** @type {Awaited<ReturnType<typeof getGenerationMap>> | undefined} */
let generationsMap;

/**
 * @param {Client} client
 * @returns {Promise<Record<string, Record<Locale, string>>>} */
async function getGenerationMap(client) {
  const generations = await Promise.all(
    (await pokedex.getGenerationsList()).results.map(async e => pokedex.getGenerationByName(e.name))
  );

  return generations.reduce((acc, gen) => {
    const names = Object.fromEntries(gen.names
      .filter(e => client.i18n.availableLocales.has(e.language.name))
      .map(e => [e.language.name, e.name]));

    for (const version of gen.version_groups) acc[version.name] = names;
    return acc;
  }, {});
}

/** @param {PokedexT.Pokemon} pokemon */
async function getEvolutions(pokemon) {
  const

    /** @type {(chain: PokedexT.Chain) => string[]} */
    getEvolutionNames = chain => [chain.species.name, ...chain.evolves_to.flatMap(getEvolutionNames)],
    chainUrl = (await pokedex.getPokemonSpeciesByName(pokemon.species.name)).evolution_chain.url;

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- will always be a chain */
  return getEvolutionNames((await pokedex.getResource(chainUrl)).chain);
}

/** @type {command<'both', false>} */
module.exports = {
  usage: { examples: 'Bulbasaur' }, beta: 1,
  prefixCommand: true,
  slashCommand: true,
  dmPermission: true,
  options: [{
    name: 'pokémon',
    type: 'String',
    required: true,
    strictAutocomplete: true,
    async autocompleteOptions() { return (await pokedex.getPokemonsList()).results.map(e => e.name); }
  }],

  async run(lang) {
    const msg = await this.customReply(lang('global.loading', this.client.application.getEmoji('loading')));

    let /** @type {PokedexT.Pokemon} */ pokemon = await pokedex.getPokemonByName(this.options?.getString('pokémon', true) ?? this.args[0]);
    if (Array.isArray(pokemon)) pokemon = pokemon[0];

    /* eslint-disable require-atomic-updates -- fine here */
    genderMap ??= await getGenderMap();
    generationsMap ??= await getGenerationMap(this.client);
    /* eslint-enable require-atomic-updates */

    const
      height = pokemon.height < DM_TO_CM
        ? `${Number.parseFloat((pokemon.height * DM_TO_CM).toFixed(2))}cm`
        : `${Number.parseFloat((pokemon.height * DM_TO_M).toFixed(2))}m`,
      weight = pokemon.weight < HG_TO_KG
        ? `${Number.parseFloat((pokemon.weight * HG_TO_G).toFixed(2))}g`
        : `${Number.parseFloat((pokemon.weight * HG_TO_KG).toFixed(2))}kg`,
      genders = genderMap[pokemon.species.name] ?? 'global.unknown',
      genderRatio = typeof genders == 'string'
        ? lang(`gender.${genders}`)
        : Object.entries(genders).map(([k, v]) => `${lang('gender.' + k)}: ${inlineCode(v)}`).join(', '),
      embed = new EmbedBuilder({
        thumbnail: { url: pokemon.sprites.other.showdown.front_default },
        color: Colors.Blurple,
        footer: {
          text: (await pokedex.getPokemonSpeciesByName(pokemon.species.name)).flavor_text_entries
            .findLast(e => e.language.name == (this.guild?.localeCode ?? this.user.localeCode)).flavor_text
            .replaceAll('\f', '\n') // See https://github.com/veekun/pokedex/issues/218#issuecomment-339841781
            .replaceAll('\u00AD\n', '')
            .replaceAll('\u00AD', '')
            .replaceAll(' -\n', ' - ')
            .replaceAll('-\n', '-')
            .replaceAll('\n', ' ')
        },
        author: {
          name: `PokéDex: ${capitalize(pokemon.name)}`,
          iconURL: pokemon.sprites.other.showdown.front_shiny
        },
        fields: [
          [lang('types'), pokemon.types.map(e => e.type.name).join(', ')],
          [lang('abilities'), pokemon.abilities.map(e => capitalize(e.ability.name)).join(', ')],
          [lang('genderRatio'), genderRatio],
          [lang('heightWeight'), `${height}, ${weight}`],
          [
            lang('evolutionLine'),
            (await getEvolutions(pokemon)).map(e => (e == pokemon.species.name ? bold(capitalize(e)) : capitalize(e))).join(', ')
          ],
          [
            lang('gen'),
            (
              generationsMap[pokemon.game_indices[0].version.name]
              ?? Object.entries(generationsMap).find(([k]) => k.includes(pokemon.game_indices[0].version.name))[1]
            )[this.guild?.localeCode ?? this.user.localeCode]
          ]
        ].map(/** @param {[string, string]} field */ ([k, v]) => ({ name: k, value: v, inline: false }))
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: 'Bulbapedia',
            style: ButtonStyle.Link,
            url: `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}`
          }),
          new ButtonBuilder({
            label: 'Serebii',
            style: ButtonStyle.Link,
            url: `https://www.serebii.net/pokedex-swsh/${pokemon.name}`
          }),
          new ButtonBuilder({
            label: 'Smogon',
            style: ButtonStyle.Link,
            url: `https://www.smogon.com/dex/ss/pokemon/${pokemon.name}`
          })
        ]
      });

    return msg.edit({ content: '', embeds: [embed], components: [component] });
  }
};