/* eslint-disable sonarjs/expression-complexity, custom/cyclomatic-complexity -- will be fixed when commands are moved to their own lib */

/** @type {import('.').slashCommandsEqual} */
module.exports = function equal(a, b) {
  /* eslint-disable-next-line @typescript-eslint/no-base-to-string -- Intentional for now - */
  if (!a?.toString() && !b?.toString()) return true;
  if (typeof a == 'string' || typeof b == 'string') return a == b;
  if (a == undefined && !b?.__count__ || b == undefined && !a?.__count__) return true;
  if (
    !!a != !!b || a.name != b.name || a.description != b.description || a.type != b.type || a.autocomplete != b.autocomplete
    || a.dmPermission != b.dmPermission || a.value != b.value || (a.options?.length ?? 0) != (b.options?.length ?? 0)
    || (a.channelTypes?.length ?? 0) != (b.channelTypes?.length ?? 0) || (a.choices?.length ?? 0) != (b.choices?.length ?? 0)
    || a.minValue != b.minValue || a.maxValue != b.maxValue || a.minLength != b.minLength || a.maxLength != b.maxLength
    || !!a.required != !!b.required || a.defaultMemberPermissions?.bitfield != b.defaultMemberPermissions?.bitfield
    || !equal(a.nameLocalizations, b.nameLocalizations) || !equal(a.descriptionLocalizations, b.descriptionLocalizations)
  ) return false;

  if (a.choices?.length) {
    for (let i = 0; i < a.choices?.length; i++) {
      if (
        !equal(a.choices[i], b.choices.find(e => e.name == a.choices[i].name))
        || !equal(b.options[i], a.choices.find(e => e.name == b.choices[i].name))
      ) return false;
    }
  }

  if (a.channelTypes) for (const channelType of a.channelTypes) if (!b.channelTypes.includes(channelType)) return false;

  return true;
};