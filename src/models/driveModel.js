import Action from 'action-js';
import { find } from 'lodash';
import { extractToken } from 'edge-ms-helper/authorization-helper';
import NodesMapper from '../helper/nodes-mapper';

function makeDriveModel(context, authorization) {
  const { edge } = context;
  const { serviceType } = context.info;
  const accessToken = extractToken(authorization);

  function findNearby() {
    return new Action((cb) => {
      edge.clusterDiscovery('linkLocal', accessToken, nodes => cb(nodes), err => cb(err));
    })
    .next(nodes => ((
        nodes &&
        Array.isArray(nodes.localLinkNetwork.nodes) &&
        nodes.localLinkNetwork
      ) || new Error('failed to search for devices')
    ))
    .next(linkLocal => NodesMapper.transformMdsNodes(linkLocal.nodes, null, serviceType));
  }

  function findProximity() {
    return new Action((cb) => {
      edge.clusterDiscovery('proximity', accessToken, nodes => cb(nodes), err => cb(err));
    })
    .next(nodes => ((
        nodes &&
        Array.isArray(nodes.proximity.nodes) &&
        nodes.proximity
      ) || new Error('failed to search for devices')
    ))
    .next(proximity => NodesMapper.transformMdsNodes(proximity.nodes, null, serviceType));
  }

  function findById(nodeId) {
    return Action.parallel([findNearby(), findProximity()])
      .next(data => (
        find(data[0], device => (device.id === nodeId)) ||
        find(data[1], device => (device.id === nodeId))
      ))
      .next(device => device || new Error(`Cannot find device with id: ${nodeId}`));
  }

  return {
    findNearby,
    findProximity,
    findById,
  };
}

module.exports = makeDriveModel;
