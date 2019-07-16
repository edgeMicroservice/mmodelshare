import Action from 'action-js';
import makeFileModel from '../models/fileModel';

function makeFileProcessor(context) {
  const { storage } = context;
  const fileModel = makeFileModel(storage);

  function getFile(fileId) {
    return new Action((cb) => {
      try {
        cb(fileModel.findById(fileId));
      } catch (e) {
        cb(e);
      }
    });
  }

  function createFile(fileMetadata, file) {
    return new Action((cb) => {
      if (!fileMetadata) {
        cb(new Error('File metadata is required.'));
        return;
      }
      const validMetadata = fileModel.validate(fileMetadata, file.path);
      if (!validMetadata) {
        cb(new Error('Invalid metadata'));
        return;
      }

      const metadata = {
        ...validMetadata,
        path: file.path,
        size: file.size,
      };

      try {
        fileModel.insert(metadata);
        cb(metadata);
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

  return {
    getFile,
    createFile,
    deleteFile,
  };
}

module.exports = makeFileProcessor;
