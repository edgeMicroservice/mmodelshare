const Action = require('action-js');
const makeFileModel = require('../models/fileModel');

function makeFileProcessor(context) {
  const fileModel = makeFileModel(context);

  function getFile(fileId) {
    return new Action((cb) => {
      try {
        cb(fileModel.findById(fileId));
      } catch (e) {
        cb(e);
      }
    });
  }

  function getFiles() {
    return new Action((cb) => {
      try {
        cb(fileModel.getAll());
      } catch (e) {
        cb(e);
      }
    });
  }

  function createFile(metadata, file) {
    return new Action((cb) => {
      if (!metadata) {
        cb(new Error('File metadata is required.'));
        return;
      }
      const validMetadata = fileModel.validate(metadata, file.path);
      console.log(validMetadata);
      if (!validMetadata) {
        cb(new Error('Invalid metadata'));
        return;
      }

      const fileMetadata = {
        ...validMetadata,
        path: file.path,
        size: file.size,
      };

      try {
        fileModel.insert(fileMetadata);
        cb(fileMetadata);
      } catch (e) {
        cb(new Error(`insert error: ${e.message}`));
      }
    });
  }

  function deleteFile(fileId) {
    return new Action((cb) => {
      try {
        cb(fileModel.deleteById(fileId));
      } catch (e) {
        cb(e);
      }
    });
  }

  function handleEssEvent(newEvent) {
    return new Action((cb) => {
      // console.log(`**** kick: ${JSON.stringify(newEvent, null, 2)}`);

      const {
        id, type: name, version, dataOriginLink,
      } = newEvent;

      const metadata = fileModel.updateDefault(id, name, version, dataOriginLink);

      cb(metadata);
    });
  }

  return {
    getFile,
    getFiles,
    createFile,
    deleteFile,
    handleEssEvent,
  };
}

module.exports = makeFileProcessor;
