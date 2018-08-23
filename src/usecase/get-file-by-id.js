import Action from 'action-js';

export default class GetFiles {
  constructor(storage) {
    this.storage = storage;
  }

  buildAction(id) {
    return new Action((cb) => {
      const { storage } = this;
      const val = storage.getItem(id);

      if (!val) {
        cb(new Error('no such file'));
        return;
      }

      try {
        const file = JSON.parse(val);
        cb(file);
      } catch (e) {
        cb(new Error(e.message));
      }
    });
  }
}
