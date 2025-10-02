type data = {
  options?: commandOptions<false, 'slash'>[];
  run: NonNullable<command<'slash'>['run']>;
};
export= data;