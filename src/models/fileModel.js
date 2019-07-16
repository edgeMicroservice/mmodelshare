function makeFileModel(storage) {
  function validate(json, fileId) {
    try {
      const file = JSON.parse(json);

      if (!file || !file.mimeType) {
        return undefined;
      }

      return {
        id: fileId,
        kind: 'drive#file',
        name: file.name,
        mimeType: file.mimeType,
        description: file.description,
        contentHints: file.contentHints,
        ImageMediaMetadata: file.ImageMediaMetadata,
        VideoMediaMetadata: file.VideoMediaMetadata,
        createTime: new Date(Date.now()).toISOString(),
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
    deleteById,
  };
}

module.exports = makeFileModel;
