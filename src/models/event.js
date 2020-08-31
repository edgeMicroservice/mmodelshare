const Action = require('action-js');

function makeEventModel(context) {
  const { storage } = context;
  const { MAX_EVENT_COUNT } = context.env;
  const EVENT_TAG = 'EVENT';

  function generate() {
    /* eslint-disable */
    var lut = []; for (var i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }

    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
      lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
      lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
      lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    /* eslint-enable */
  }

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

  function eventCleanup() {
    return getEvents()
      .next((events) => {
        if (events.length <= MAX_EVENT_COUNT) {
          return [];
        }

        const count = events.length - MAX_EVENT_COUNT;
        const removeEvents = events.slice(0, count);
        return removeEvents;
      })
      .next((removeEvents) => {
        removeEvents.forEach((evt) => {
          storage.removeItem(evt.id);
        });

        return removeEvents;
      });
  }

  function createEvent(newEvent) {
    return new Action((cb) => {
      const evt = {
        ...newEvent,
        id: generate(),
        createTime: new Date(Date.now()).toISOString(),
      };

      const json = JSON.stringify(evt);
      storage.setItemWithTag(evt.id, json, EVENT_TAG);

      cb(evt);
    }).next(evt => eventCleanup().next(() => evt));
  }

  return {
    getEvents,
    createEvent,
  };
}

module.exports = makeEventModel;
