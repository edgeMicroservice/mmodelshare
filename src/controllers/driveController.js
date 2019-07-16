import response from '../edge-ms-helper/response-helper';
import makeDriveProcessor from '../processors/driveProcessor';

function getDrives(req, res) {
  const type = req.swagger.params.type || 'network';

  if (!req.authorization) {
    response.sendError({ message: 'Authorization header is required.' }, 401, res);
    return;
  }

  const driveProcessor = makeDriveProcessor(req);

  driveProcessor.getDrives(type)
    .next(data => ({ type, data }))
    .next(json => response.sendResult(json, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function getNode(req, res) {
  if (!req.authorization) {
    response.sendError({ message: 'Authorization header is required.' }, 401, res);
    return;
  }

  const { id } = req.swagger.params;
  const driveProcessor = makeDriveProcessor(req);

  driveProcessor.getNode(id)
    .next(drive => response.sendResult(drive, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function getBep(req, res) {
  const driveProcessor = makeDriveProcessor(req);
  const { hmac } = req.swagger.params;

  driveProcessor.requestBep(hmac)
    .next(bep => response.sendResult(bep, 200, res))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

module.exports = {
  getDrives,
  getNode,
  getBep,
};
