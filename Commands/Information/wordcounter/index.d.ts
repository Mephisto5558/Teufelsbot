type data = {
  options?: commandOptions<false>[];
  run: NonNullable<command<'slash', false>['run']>;
};
export= data;