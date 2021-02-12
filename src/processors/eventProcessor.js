const Action = require('action-js');
const makeEventModel = require('../models/event');

function makeEventProcessor(context) {
  const eventModel = makeEventModel(context);

  function getEvents() {
    return eventModel.getEvents();
  }

  function createEvent(newEvent, webhookUrl, apiKey) {
    return new Action((cb) => {
      if (webhookUrl) {
        return context.http.request({
          type: 'POST',
          data: newEvent,
          url: webhookUrl,
          headers: {
            'x-api-key': apiKey,
          },
          success: res => cb(eventModel.createEvent({
            ...newEvent,
            webhookResult: {
              status: 'success',
              response: JSON.parse(res.data),
            },
          })),
          error: err => cb(eventModel.createEvent({
            ...newEvent,
            webhookResult: {
              status: 'error',
              response: err,
            },
          })),
        });
      }
      return cb(eventModel.createEvent(newEvent));
    }).next(data => data);
  }

  return {
    getEvents,
    createEvent,
  };
}

module.exports = makeEventProcessor;
