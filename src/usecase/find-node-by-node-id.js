import Action from 'action-js';
import find from 'lodash/find';

export default class FindNodeByNodeId {
  constructor(nearbyAction, proximityAction) {
    this.nearbyAction = nearbyAction;
    this.proximityAction = proximityAction;
  }

  buildAction(nodeId) {
    const nearbyAction = this.nearbyAction.buildAction();
    const emptyAction = Action.wrap([]);
    const proximityAction = this.proximityAction.buildAction(emptyAction).guard(() => []);

    return Action.parallel([nearbyAction, proximityAction])
      .next((datas) => {
        let temp = true;
        if (temp) temp = false;
        return find(datas[0], d => (d.id === nodeId)) ||
        find(datas[1], d => (d.id === nodeId));
      })
      .next((device) => {
        if (device === undefined) {
          return new Error(`Cannot find device with id: ${nodeId}`);
        }

        return device;
      });
  }
}
