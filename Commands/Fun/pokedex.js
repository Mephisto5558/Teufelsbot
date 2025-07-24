const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js'),
  fetch = require('node-fetch').default,
  { HTTP_STATUS_NOT_FOUND } = require('node:http2').constants,
  INCHES_IN_FEET = 12,
  CENTIMETERS_IN_METER = 100,
  CENTIMETERS_IN_INCH = 2.54,
  KILOGRAMS_IN_POUND = 2.205,

  /* eslint-disable-next-line @stylistic/max-len -- cannot really do much about this one */
  /** @type {Collection<string, { height: string, weight: string, name: string, types: string[], abilities: Record<string, string>, gender?: string[], family: Record<string, string> }>} */
  cache = new Collection();

/** @type {command<'both', false>} */
module.exports = {
  usage: { examples: 'Bulbasaur' },
  prefixCommand: true,
  slashCommand: true,
  dmPermission: true,
  options: [{
    name: 'pokémon',
    type: 'String',
    required: true
  }],

  async run(lang) {
    const
      pokemon = this.options?.getString('pokémon', true) ?? this.args[0],
      msg = await this.customReply(lang('global.loading', getEmoji('loading')));

    let res = cache.get(pokemon.toLowerCase());
    if (!res) {
      try { res = (await fetch(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`).then(e => e.json()))?.[0]; }
      catch (err) {
        if (err.type != 'invalid-json') throw err;
        return msg.edit(lang('invalidJson'));
      }

      if (res) {
        const
          [feet, inches] = res.height.split('\'').map(e => Number.parseFloat(e)),
          height = (feet * INCHES_IN_FEET + (Number.isNaN(inches) ? 0 : inches ?? 0)) * CENTIMETERS_IN_INCH;

        res.height = height < CENTIMETERS_IN_METER ? `${height}cm` : `${Number.parseFloat((height / CENTIMETERS_IN_METER).toFixed(2))}m`;

        if (res.name) cache.set(res.name.toLowerCase(), res);
      }
    }

    if (!res || res.error == HTTP_STATUS_NOT_FOUND) return msg.edit(lang('notFound'));
    if (res.error) {
      log.error(`${this.commandName}.js: The api returned an error!`, res);
      return msg.edit(lang('error'));
    }

    const
      name = res.name.toLowerCase(),
      embed = new EmbedBuilder({
        thumbnail: { url: `https://play.pokemonshowdown.com/sprites/ani/${name}.gif` },
        color: Colors.Blurple,
        footer: { text: res.description },
        author: {
          name: `PokéDex: ${res.name}`,
          iconURL: `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`
        },
        fields: [
          [lang('types'), res.types.join(', ')],
          [lang('abilities'), `${res.abilities.normal}${res.abilities.hidden ? ' and ' + res.abilities.hidden : ''}.`],
          [lang('genderRatio'), res.gender?.join(', ') ?? lang('noGender')],
          [lang('heightWeight'), `${res.height}, ${(Number.parseFloat(res.weight) / KILOGRAMS_IN_POUND).toFixed(2)}kg`],
          [lang('evolutionLine'), res.family.evolutionLine.join(', ') + lang('currentStage', res.family.evolutionStage)],
          [lang('gen'), res.gen]
        ].map(([k, v]) => ({ name: k, value: v, inline: false }))
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: 'Bulbapedia',
            style: ButtonStyle.Link,
            url: `https://bulbapedia.bulbagarden.net/wiki/${res.name}`
          }),
          new ButtonBuilder({
            label: 'Serebii',
            style: ButtonStyle.Link,
            url: `https://www.serebii.net/pokedex-swsh/${name}`
          }),
          new ButtonBuilder({
            label: 'Smogon',
            style: ButtonStyle.Link,
            url: `https://www.smogon.com/dex/ss/pokemon/${name}`
          })
        ]
      });

    return msg.edit({ content: '', embeds: [embed], components: [component] });
  }
};