import Action from 'action-js';

export const requestRemoteBep = (req, drive) => new Action((cb) => {
  const sepHeader = `\r\nx-mimik-port: ${drive.routing.port}\r\nx-mimik-routing: ${drive.routing.id}`;
  req.context.http.request(({
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

