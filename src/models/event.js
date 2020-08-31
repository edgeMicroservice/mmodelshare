const Action = require('action-js');

function makeEventModel(context) {
  const { storage } = context;
  const EVENT_TAG = 'EVENT';

  function getEvents() {
    return new Action((cb) => {
      const db = [];
      storage.eachItemByTag(EVENT_TAG, (key, value) => {
        const json = JSON.parse(value);
        db.push(json);
      });

      cb(db);
    });
  }

  function createEvent(newEvent) {
    const evt = {
      ...newEvent,
      createTime: new Date(Date.now()).toISOString(),
    };

    const json = JSON.stringify(evt);
    storage.setItemWithTag(newEvent.modelId, json, EVENT_TAG);
  }

  return {
    getEvents,
    createEvent,
  };
}

module.exports = makeEventModel;
