const makeEventModel = require('../models/event');

function makeEventProcessor(context) {
  const eventModel = makeEventModel(context);

  function getEvents() {
    return eventModel.getEvents();
  }

  function createEvent(newEvent) {
    return eventModel.createEvent(newEvent);
  }

  return {
    getEvents,
    createEvent,
  };
}

module.exports = makeEventProcessor;
