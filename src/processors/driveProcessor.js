import Action from 'action-js';
import { requestRemoteBep } from '../helper/bep-request';
import makeDriveModel from '../models/driveModel';

function makeDriveProcessor(req) {
  const { context, authorization } = req;
  const driveModel = makeDriveModel(context, authorization);

  function getDrives(type) {
    switch (type) {
      case 'network':
        return driveModel.findNearby();
      case 'nearby':
        return driveModel.findProximity();
      default:
        return new Action(cb => cb(new Error(`"${type}" type is not supported`)));
    }
  }

  function getNode(nodeId) {
    return driveModel.findById(nodeId)
      .next((drive) => {
        if (drive.url) return drive;
        return requestRemoteBep(req, drive)
          .next(url => ({ ...drive, url: url.href }));
      });
  }

  function requestBep(code) {
    return new Action(cb =>
      context.edge.requestBep({
        code,
        success: result => cb({ href: result.data }),
        error: err => cb(new Error(err.message)),
      }),
    );
  }

  return {
    getDrives,
    getNode,
    requestBep,
  };
}

module.exports = makeDriveProcessor;
