const { init } = require('./edge-ms-helper/init-helper');
const swaggerMiddleware = require('./middleware/mmodelshare-swagger-mw');

mimikModule.exports = init(swaggerMiddleware);
