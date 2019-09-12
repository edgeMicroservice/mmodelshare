import response from 'edge-ms-helper/response-helper';
import { extractToken } from 'edge-ms-helper/authorization-helper';
import makeFileProcessor from '../processors/fileProcessor';

function getModel(req, res) {
  const { alt } = req.swagger.params;

  const fileProcessor = makeFileProcessor(req.context);
  fileProcessor.getFile('imagemodel.zip')
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

function createModel(req, res) {
  const { context, authorization, body, swagger } = req;
  const { uploadType } = swagger.params;
  const authKey = context.env.AUTHORIZATION_KEY;

  const fileProcessor = makeFileProcessor(context);
  const fileData = { path: 'imagemodel.zip' };
  let metadata;

  if (extractToken(authorization) !== authKey) {
    response.sendError(new Error('Incorrect authorization key'), 403, res);
    return;
  }

  if (uploadType && uploadType === 'json') {
    metadata = body;
  } else {
    req.handleFormRequest({
      found: (key, filename) => {
        switch (key) {
          case 'metadata':
            return { action: 'get' };
          case 'file':
            fileData.filename = filename;
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
  }

  fileProcessor.createFile(metadata, fileData)
    .next(file => response.sendResult(file, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function deleteModel(req, res) {
  const { context, authorization } = req;
  const authKey = context.env.AUTHORIZATION_KEY;

  const fileProcessor = makeFileProcessor(context);

  if (extractToken(authorization) !== authKey) {
    response.sendError(new Error('Incorrect authorization key'), 403, res);
    return;
  }

  fileProcessor.deleteFile('imagemodel.zip')
    .next(file => response.sendResult(file, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

module.exports = {
  getModel,
  createModel,
  deleteModel,
};
