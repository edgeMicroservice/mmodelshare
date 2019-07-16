import Action from 'action-js';

export const requestRemoteBep = (drive, http) => new Action((cb) => {
  const sepHeader = `\r\nx-mimik-port: ${drive.routing.port}\r\nx-mimik-routing: ${drive.routing.id}`;
  http.request(({
    url: `${drive.routing.url}/superdrive/v1/bep`,
    authorization: sepHeader,
    success: (result) => {
      cb(JSON.parse(result.data));
    },
    error: (err) => {
      cb(new Error(err.message));
    },
  }));
});

export const getHmacCodeByReq = (accessToken, nodeId, edge) => new Action((cb) => {
  edge.getRequestBepHmacCode(accessToken, nodeId,
    hmacCode => cb(hmacCode),
    e => cb(e));
});

