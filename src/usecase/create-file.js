import Action from 'action-js';

export default class CreateFile {
  constructor(storage) {
    this.storage = storage;
  }

  buildAction(metadata, file) {
    return new Action((cb) => {
      const { storage } = this;
      const localmetadata = metadata;

      localmetadata.path = file.path;

      localmetadata.size = file.size;

      try {
        const json = JSON.stringify(localmetadata);

        storage.setItem(localmetadata.id, json);
        cb(localmetadata);
      } catch (e) {
        cb(e);
      }
    });
  }
}
