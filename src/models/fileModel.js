function makeFileModel(context) {
  const FILE_TAG = 'FILE';
  const DEFAULT_KEY = 'default';
  const { storage } = context;
  const { MODEL_URL, MODEL_VERSION } = context.env;

  function validate(json, fileId) {
    try {
      const file = JSON.parse(json);

      if (!file || !file.mimeType) {
        return undefined;
      }

      return {
        id: fileId,
        name: file.name,
        version: file.version,
        description: file.description,
        mimeType: file.mimeType,
        createTime: new Date(Date.now()).toISOString(),
        kind: 'drive#file',
      };
    } catch (e) {
      return undefined;
    }
  }

  function findByIdEx(fileId) {
    const file = storage.getItem(fileId);
    if (!file) {
      throw new Error('No such file');
    }
    return JSON.parse(file);
  }

  function insert(metadata) {
    const json = JSON.stringify(metadata);
    storage.setItemWithTag(metadata.id, json, FILE_TAG);
  }

  function deleteById(fileId) {
    const file = findByIdEx(fileId);
    storage.removeItem(fileId);
    storage.deleteFile(fileId);
    return file;
  }

  function insertDefault() {
    const id = 'default';
    const defaultNew = {
      id,
      name: id,
      version: MODEL_VERSION,
      originUrl: MODEL_URL,
      mimeType: 'application/octet-stream',
      createTime: new Date(Date.now()).toISOString(),
      kind: 'drive#file',
    };

    const defaultExisting = storage.getItem(id);
    if (defaultExisting) {
      const existing = JSON.parse(defaultExisting);
      if (existing.version <= defaultNew.version) {
        return existing;
      }

      deleteById(id);
    }

    return insert(defaultNew);
  }

  function findById(fileId) {
    if (fileId === DEFAULT_KEY) {
      insertDefault();
    }
    return findByIdEx(fileId);
  }

  function getAll() {
    insertDefault();

    const db = [];
    storage.eachItemByTag(FILE_TAG, (key, value) => {
      const json = JSON.parse(value);
      db.push(json);
    });
    return db;
  }

  function updateDefault(id, name, version, dataOriginLink) {
    const metadata = {
      id: 'default',
      name: 'default',
      version,
      originUrl: dataOriginLink.url,
      mimeType: 'application/octet-stream',
      createTime: new Date(Date.now()).toISOString(),
      kind: 'drive#file',
    };

    const json = JSON.stringify(metadata);
    storage.setItemWithTag(metadata.id, json, FILE_TAG);

    return metadata;
  }

  return {
    validate,
    insert,
    findById,
    getAll,
    deleteById,
    updateDefault,
  };
}

module.exports = makeFileModel;
