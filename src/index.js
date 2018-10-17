import Router from 'router';
import queryString from 'query-string';
import Action from 'action-js';
import ApiError from './helper/api-error';
import { NewFileModel } from './model/drive-models';
import mimikInject from './helper/mimik-injector';
import toJson from './helper/json-helper';
import extractToken from './helper/authorization-helper';
import { requestBep, requestRemoteBep } from './helper/bep-request';

const app = Router({ mergeParams: true });

// Initialize mimik serverless api
mimikModule.exports = (context, req, res) => {
  req.mimikContext = mimikInject(context, req);
  res.writeError = (apiError) => {
    res.statusCode = apiError.code;
    const json = JSON.stringify({
      code: apiError.code,
      message: apiError.message,
    });
    res.end(json);
  };

  app(req, res, (e) => {
    const err = (e && new ApiError(400, e.message)) ||
      new ApiError(404, 'not found');
    res.writeError(err);
  });
};

// GET drives by local network or proximity
app.get('/drives', (req, res) => {
  const { getNearByDrives, getProximityDrives } = req.mimikContext;
  const query = queryString.parse(req._parsedUrl.query);
  const type = (query && query.type) || 'network';

  let action;
  switch (type) {
    case 'network':
      action = getNearByDrives.buildAction();
      break;
    case 'nearby':
      action = getProximityDrives.buildAction();
      break;
    default:
      action = new Action(cb => cb(new Error(`"${type}" type is not supported`)));
      break;
  }

  action.next((data) => {
    const dataList = { type, data };
    return toJson(dataList);
  })
    .next(json => res.end(json))
    .guard((err) => {
      res.writeError(new ApiError(400, err.message));
    })
    .go();
});

// Get Node by NodeId
app.get('/nodes/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const { findNode } = req.mimikContext;

  findNode.buildAction(nodeId).next((drive) => {
    if (drive.url) {
      res.end(toJson(drive));
      return 0;
    }
    const { http } = req.mimikContext;
    return requestRemoteBep(drive, http)
      .next(url => Object.assign({}, drive, { url: url.href }))
      .next(d => res.end(toJson(d)));
  })
    .guard(e => res.writeError(new ApiError(400, e)))
    .go();
});

// Get BEP
app.get('/bep', (req, res) => {
  const { edge } = req.mimikContext;

  requestBep(edge)
    .next(bep => res.end(toJson(bep)))
    .guard(e => res.writeError(new ApiError(400, e)))
    .go();
});

// GET model
app.get('/model', (req, res) => {
  const fileId = 'imagemodel.zip';
  const { getFileById } = req.mimikContext;
  const query = queryString.parse(req._parsedUrl.query);
  let action = getFileById.buildAction(fileId);

  if (query.alt === 'media') {
    action = action.next((file) => {
      res.writeMimeFile(file.path, file.mimeType);
    });
  } else {
    action = action.next(fileModel => toJson(fileModel))
      .next(json => res.end(json));
  }

  action.guard(e => res.writeError(new ApiError(400, e.message))).go();
});

// POST model File
app.post('/model', (req, res) => {
  let metadataBuf = '';
  const id = 'imagemodel.zip';
  const file = {};
  const { createFile } = req.mimikContext;
  const authorization = req.authorization;
  const authKey = req.mimikContext.env.AUTHORIZATION_KEY;

  if (extractToken(authorization) !== authKey) {
    res.writeError(new ApiError(403, 'incorrect authorization key'));
    return;
  }

  const query = queryString.parse(req._parsedUrl.query);

  if (query.uploadType === 'json') {
    if (req.body) {
      metadataBuf = req.body;
    } else {
      res.writeError(new ApiError(400, 'invalid or missing body'));
      return;
    }
  } else {
    req.handleFormRequest({
      found: (key, filename) => {
        let todo = {
          action: 'skip',
        };
        if (key === 'metadata') {
          todo = {
            action: 'get',
          };
        } else if (key === 'file') {
          file.filename = filename;
          todo = {
            action: 'store',
            path: `${id}`,
          };
        }

        return todo;
      },
      get: (key, value) => {
        metadataBuf = metadataBuf.concat(value);
      },
      store: (filepath, filesize) => {
        file.path = id;
        file.size = filesize;
      },
    });
  }

  const metadata = NewFileModel.validate(metadataBuf, id);
  if (!metadata) {
    res.writeError(new ApiError(400, 'invalid metadata'));
    return;
  }

  createFile.buildAction(metadata, file)
    .next(fileModel => toJson(fileModel))
    .next(json => res.end(json))
    .guard(e => res.writeError(new ApiError(400, e.message)))
    .go();
});

// Delete Model File
app.delete('/model', (req, res) => {
  const fileId = 'imagemodel.zip';
  const { storage } = req.mimikContext;
  const authorization = req.authorization;
  const authKey = req.mimikContext.env.AUTHORIZATION_KEY;

  if (extractToken(authorization) !== authKey) {
    res.writeError(new ApiError(403, 'incorrect authorization key'));
    return;
  }

  const item = storage.getItem(fileId);
  if (!item) {
    res.writeError(new ApiError(400, `no such file: ${fileId}`));
    return;
  }

  storage.removeItem(fileId);
  storage.deleteFile(fileId);
  res.end(item);
});
