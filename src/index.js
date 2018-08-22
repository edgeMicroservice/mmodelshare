import Router from 'router';
import queryString from 'query-string';
import Action from 'action-js';
import parseUrl from 'parseurl';
import GetProximityDrives from './usecase/get-proximity-drives';
import GetNearbyDrives from './usecase/get-nearby-drives';
import ApiError from './helper/api-error';
import FindNodeByNodeId from './usecase/find-node-by-node-id';
import { NewFileModel } from './model/drive-models';

const app = Router({
  mergeParams: true,
});

function toJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function extractToken(authorization) {
  return (authorization && authorization.length && authorization.split(' ')[1]);
}

function mimikInject(context, req) {
  const { uMDS } = context.env;
  const edge = context.edge;
  const http = context.http;
  const authorization = req.authorization;
  parseUrl(req);

  const getNearByDrives = new GetNearbyDrives(uMDS, http, authorization, edge);
  const getProximityDrives = new GetProximityDrives(uMDS, http, authorization, edge);

  const findNode = new FindNodeByNodeId(getNearByDrives, getProximityDrives);

  return ({
    ...context,
    getNearByDrives,
    getProximityDrives,
    findNode,
  });
}

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
  //  }
  action
    .next((data) => {
      const dataList = { type, data };

      return toJson(dataList);
    })
    .next(json => res.end(json))
    .guard((err) => {
      console.log(`example ==> ${err.message}`);
      res.writeError(new ApiError(400, err.message));
    })
    .go();
});
const requestBep = edge => new Action(
  (cb) => {
    edge.requestBep({
      success: (result) => {
        cb({
          href: result.data,
        });
      },
      error: (err) => {
        cb(new Error(err.message));
      },
    });
  });
const requestRemoteBep = (drive, http) => new Action(
  (cb) => {
    const sepHeader = `\r\nx-mimik-port: ${drive.routing.port}\r\nx-mimik-routing: ${drive.routing.id}`;
    http.request(({
      url: `${drive.routing.url}/superdrive/v1/bep`,
      authorization: sepHeader,
      success: (result) => {
        cb(JSON.parse(result.data));
      },
      error: (err) => {
        console.log(`sep error: ${err.message}`);
        cb(new Error(err.message));
      },
    }));
  });

app.get('/nodes/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const { findNode } = req.mimikContext;

  findNode.buildAction(nodeId)
    .next((drive) => {
      if (drive.url) {
        res.end(toJson(drive));
        return 0;
      }

      const { http } = req.mimikContext;
      return requestRemoteBep(drive, http)
        .next(url => Object.assign({}, drive, {
          url: url.href,
        }))
        .next(d => res.end(toJson(d)));
    })
    // .next(drive => res.end(toJson(drive)))
    .guard(e => res.writeError(new ApiError(400, e)))
    .go();
});

app.get('/bep', (req, res) => {
  const { edge } = req.mimikContext;

  requestBep(edge)
    .next(bep => res.end(toJson(bep)))
    .guard(e => res.writeError(new ApiError(400, e)))
    .go();
});

app.get('/model', (req, res) => {
  const fileId = 'imagemodel.zip';

  const query = queryString.parse(req._parsedUrl.query);

  let action = req.injector.getFileByIdInstance(fileId).buildAction();
  if (query.alt === 'media') {
    action = action.next(file => res.writeMimeFile(file.path, file.mimeType));
  } else {
    action = action
      .next(fileModel => toJson(fileModel))
      .next(json => res.end(json));
  }

  action
      .guard(e => res.writeError(new ApiError(400, e.message)))
      .go();
});

app.post('/model', (req, res) => {
  let metadataBuf = '';
  const file = {};
  const id = 'imagemodel.zip';

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

  req.injector.createFileInstance(metadata, file)
    .buildAction()
    .next(fileModel => toJson(fileModel))
    .next(json => res.end(json))
    .guard(e => res.writeError(new ApiError(400, e.message)))
    .go();
});

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
