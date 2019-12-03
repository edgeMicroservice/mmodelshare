function makeFileModel(storage) {
  function validate(json, fileId) {
    try {
      const file = JSON.parse(json);

      if (!file || !file.mimeType) {
        return undefined;
      }

      return {
        id: fileId,
        name: file.name,
        category: file.category,
        description: file.description,
        mimeType: file.mimeType,
        createTime: new Date(Date.now()).toISOString(),
        kind: 'drive#file',
      };
    } catch (e) {
      return undefined;
    }
  }

  function insert(metadata) {
    const json = JSON.stringify(metadata);
    storage.setItem(metadata.id, json);
  }

  function findById(fileId) {
    const file = storage.getItem(fileId);
    if (!file) {
      throw new Error('No such file');
    }
    return JSON.parse(file);
  }

  function getAll() {
    const db = {};
    storage.eachItem((key, value) => {
      db[key] = JSON.parse(value);
    });
    return db;
  }

  function deleteById(fileId) {
    const file = findById(fileId);
    storage.removeItem(fileId);
    storage.deleteFile(fileId);
    return file;
  }

  return {
    validate,
    insert,
    findById,
    getAll,
    deleteById,
  };
}

module.exports = makeFileModel;
