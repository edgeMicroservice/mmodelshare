import response from 'edge-ms-helper/response-helper';
import { extractToken } from 'edge-ms-helper/authorization-helper';
import makeFileProcessor from '../processors/fileProcessor';

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
  const { context, authorization } = req;
  const authKey = context.env.AUTHORIZATION_KEY;

  if (extractToken(authorization) !== authKey) {
    response.sendError(new Error('Incorrect authorization key'), 403, res);
    return;
  }
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
  const { context, authorization, swagger } = req;
  const { id } = swagger.params;
  const authKey = context.env.AUTHORIZATION_KEY;

  if (extractToken(authorization) !== authKey) {
    response.sendError(new Error('Incorrect authorization key'), 403, res);
    return;
  }

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
