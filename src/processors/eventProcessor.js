const Action = require('action-js');
const makeEventModel = require('../models/event');

function makeEventProcessor(context) {
  const eventModel = makeEventModel(context);

  function getEvents() {
    return eventModel.getEvents();
  }

  function createEvent(newEvent, webhookUrl, apiKey) {
    return eventModel.createEvent(newEvent)
      .next(data => new Action((cb) => {
        if (webhookUrl) {
          return context.http.request({
            type: 'POST',
            data,
            url: webhookUrl,
            headers: {
              'x-api-key': apiKey,
            },
            success: res => cb({ ...data, webhookResult: JSON.parse(res.data) }),
            error: err => cb({ ...data, webhookResult: err }),
          });
        }
        return cb(data);
      }));
  }

  return {
    getEvents,
    createEvent,
  };
}

module.exports = makeEventProcessor;
