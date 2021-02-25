const response = require('@mimik/edge-ms-helper/response-helper');
const makeFileProcessor = require('../processors/fileProcessor');

function getModel(req, res) {
  const { alt, id } = req.swagger.params;

  makeFileProcessor(req.context)
    .getFile(id)
    .next((file) => {
      if (alt && alt === 'media') {
        res.writeMimeFile(file.path, file.mimeType);
      } else {
        response.sendResult(file, 200, res);
      }
    })
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function getModels(req, res) {
  makeFileProcessor(req.context)
    .getFiles()
    .next(models => response.sendResult(models, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function createModel(req, res) {
  const { context } = req;
  let metadata;
  const fileData = {};

  req.handleFormRequest({
    found: (key, filename) => {
      switch (key) {
        case 'metadata':
          return { action: 'get' };
        case 'file':
          fileData.filename = filename;
          fileData.path = filename;
          return { action: 'store', path: fileData.path };
        default:
          return { action: 'skip' };
      }
    },
    get: (key, value) => {
      metadata = value;
    },
    store: (filepath, filesize) => {
      fileData.size = filesize;
    },
  });

  makeFileProcessor(context)
    .createFile(metadata, fileData)
    .next(ret => response.sendResult(ret, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function deleteModel(req, res) {
  const { context, swagger } = req;
  const { id } = swagger.params;
  makeFileProcessor(context)
    .deleteFile(id)
    .next(file => response.sendResult(file, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

module.exports = {
  getModel,
  getModels,
  createModel,
  deleteModel,
};
