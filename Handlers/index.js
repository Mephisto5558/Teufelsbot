const handlers = {
  commandHandler: require('./command_handler'),
  eventHandler: require('./event_handler'),
  slashCommandHandler: require('./slash_command_handler'),
  timeEventsHandler: require('./timeEvents_handler')
};

module.exports = handlers;