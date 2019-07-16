import Action from 'action-js';
import { keyBy, mergeWith, values, find } from 'lodash';
import { extractToken } from '../edge-ms-helper/authorization-helper';
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

  function findMine() {
    const nearby = findNearby();
    const account = new Action((cb) => {
      edge.clusterDiscovery('account', accessToken, nodes => cb(nodes), err => cb(err));
    })
    .next(data => Action.wrap({
      accountId: data.accountId,
      devices: NodesMapper.transformMdsNodes(data.nodes, null, serviceType),
    }));

    return Action.parallel([nearby, account], true)
      .next((data) => {
        const foundNearby = data[0];
        const foundAccount = data[1].devices;
        const accountId = data[1].accountId;

        const nearbyNodes = keyBy(foundNearby.filter(node => node.accountId === accountId), 'id');
        const accountNodes = keyBy(foundAccount, 'id');
        return values(mergeWith(nearbyNodes, accountNodes, oldVal => oldVal));
      });
  }

  function findById(nodeId) {
    return Action.parallel([findNearby(), findMine(), findProximity()], true)
      .next(data => (
        find(data[0], device => (device.id === nodeId)) ||
        find(data[1], device => (device.id === nodeId)) ||
        find(data[2], device => (device.id === nodeId))
      ))
      .next((device) => {
        if (!device) return new Error(`Cannot find device with id: ${nodeId}`);
        return device;
      });
  }

  return {
    findNearby,
    findProximity,
    findMine,
    findById,
  };
}

module.exports = makeDriveModel;
