const Router = require('router');
const queryString = require('query-string');
const parseUrl = require('parseurl');
const validate = require('jsonschema').validate;

const driveController = require('../controllers/driveController.js');
const fileController = require('../controllers/fileController.js');

const mw = Router();

const swaggerParams = params => (req, res, next) => {
  if (!req._query) {
    parseUrl(req);
    req._query = queryString.parse(req._parsedUrl.query) || {};
  }

  req.swagger = {};
  try {
    req.swagger.params = params.reduce((acc, p) => {
      const { in: inType, name, hasSchema, required, schema } = p;
      if (inType === 'body') {
        const body = req.body;
        try {
          if (hasSchema) {
            const instance = JSON.parse(body);
            validate(instance, schema, { throwError: true });
            acc[name] = instance;
          } else {
            acc[name] = body;
          }
        } catch (e) {
          const err = new Error(e.message);
          err.code = 400;
          throw err;
        }
      } else if (inType === 'path') {
        acc[name] = req.params[name];
      } else if (inType === 'query') {
        acc[name] = req._query[name];
      }

      if (required && !acc[name]) {
        const err = new Error(`${name} is required`);
        err.code = 400;
        throw err;
      }
      return acc;
    }, {});
  } catch (e) {
    return next(e);
  }

  return next();
};

/* eslint-disable */
const getDrivesParams = [
  {
    "in": "query",
    "name": "type",
    "required": false,
    "hasSchema": true,
    "schema": {
      "type": "string",
      "enum": [
        "nearby",
        "network"
      ],
      "default": "network"
    }
  }
];
/* eslint-enable */
mw.get('/drives', swaggerParams(getDrivesParams), driveController.getDrives);

/* eslint-disable */
const getNodeParams = [
  {
    "in": "path",
    "name": "id",
    "required": true,
    "hasSchema": true,
    "schema": {
      "type": "string"
    }
  }
];
/* eslint-enable */
mw.get('/nodes/:id', swaggerParams(getNodeParams), driveController.getNode);

/* eslint-disable */
const getModelParams = [
  {
    "in": "query",
    "name": "alt",
    "required": false,
    "hasSchema": true,
    "schema": {
      "type": "string",
      "enum": [
        "media"
      ]
    }
  }
];
/* eslint-enable */
mw.get('/model', swaggerParams(getModelParams), fileController.getModel);

/* eslint-disable */
const createModelParams = [
  {
    "in": "query",
    "name": "uploadType",
    "required": false,
    "hasSchema": true,
    "schema": {
      "type": "string",
      "enum": [
        "json"
      ]
    }
  }
];
/* eslint-enable */
mw.post('/model', swaggerParams(createModelParams), fileController.createModel);

/* eslint-disable */
const deleteModelParams = [];
/* eslint-enable */
mw.delete('/model', swaggerParams(deleteModelParams), fileController.deleteModel);

/* eslint-disable */
const getBepParams = [
  {
    "in": "query",
    "name": "hmac",
    "required": true,
    "hasSchema": true,
    "schema": {
      "type": "string"
    }
  }
];
/* eslint-enable */
mw.get('/bep', swaggerParams(getBepParams), driveController.getBep);


/* eslint-disable */
mw.use((err, req, res, next) => {
  const { code, message } = err;
  res.statusCode = code || 500;
  const json = JSON.stringify({
    code,
    message,
  });

  res.end(json);
});
/* eslint-enable */

module.exports = mw;
