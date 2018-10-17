import GetProximityDrives from '../usecase/get-proximity-drives';
import GetNearbyDrives from '../usecase/get-nearby-drives';
import CreateFile from '../usecase/create-file';
import GetFileById from '../usecase/get-file-by-id';
import FindNodeByNodeId from '../usecase/find-node-by-node-id';

export default function mimikInject(context, req) {
  const { uMDS } = context.env;
  const { edge, http, storage } = context;
  const authorization = req.authorization;

  const getNearByDrives = new GetNearbyDrives(uMDS, http, authorization, edge);
  const getProximityDrives = new GetProximityDrives(uMDS, http, authorization, edge);
  const createFile = new CreateFile(storage);
  const getFileById = new GetFileById(storage);
  const findNode = new FindNodeByNodeId(getNearByDrives, getProximityDrives);

  return ({
    ...context,
    getNearByDrives,
    getProximityDrives,
    createFile,
    getFileById,
    findNode,
  });
}
