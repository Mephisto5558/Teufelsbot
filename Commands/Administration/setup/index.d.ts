type data = {
  options?: commandOptions<false>[];
  run: NonNullable<command<'slash'>['run']>;
};
export= data;