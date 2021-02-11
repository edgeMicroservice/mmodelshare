const response = require('@mimik/edge-ms-helper/response-helper');
const makeEventProcessor = require('../processors/eventProcessor');

function getEvents(req, res) {
  const { context } = req;
  const eventProcessor = makeEventProcessor(context);

  return eventProcessor.getEvents()
    .next((data => response.sendResult({ data }, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

function createEvent(req, res) {
  const { newEvent } = req.swagger.params;
  const { context } = req;
  const { WEBHOOK_URL: webhookUrl, API_KEY: apiKey } = context.env;
  const eventProcessor = makeEventProcessor(context);

  return eventProcessor.createEvent(newEvent, webhookUrl, apiKey)
    .next((createdItem => response.sendResult(createdItem, 200, res)))
    .guard(err => response.sendError(err, res))
    .go();
}

module.exports = {
  getEvents,
  createEvent,
};
