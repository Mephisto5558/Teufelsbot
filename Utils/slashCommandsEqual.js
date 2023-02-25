module.exports = function equal(a, b) {
  if (!a?.toString() && !b?.toString()) return true;
  if (typeof a == 'string' || typeof b == 'string') return a == b;
  if (
    !!a != !!b || a.name != b.name || a.description != b.description || a.type != b.type || a.autocomplete != b.autocomplete || a.dmPermission != b.dmPermission ||
    a.value != b.value || (a.options?.length ?? 0) != (b.options?.length ?? 0) || (a.channelTypes?.length ?? 0) != (b.channelTypes?.length ?? 0) ||
    a.minValue != b.minValue || a.maxValue != b.maxValue || a.minLength != b.minLength || a.maxLength != b.maxLength || !!a.required != !!b.required ||
    !equal(a.choices, b.choices) || a.defaultMemberPermissions?.bitfield != b.defaultMemberPermissions?.bitfield ||
    !equal(a.nameLocalizations, b.nameLocalizations) || !equal(a.description_localizations, b.description_localizations)
  ) return false;

  for (let i = 0; i < (a.options?.length || 0); i++) if (!equal(a.options?.[i], b?.options?.[i])) return false;
  for (const channelType of (a.channelTypes || [])) if (!b.channelTypes.includes(channelType)) return false;

  return true;
};