const { init } = require('@mimik/edge-ms-helper/init-helper');
const swaggerMiddleware = require('../build/mmodelshare-swagger-mw');

mimikModule.exports = init(swaggerMiddleware);
