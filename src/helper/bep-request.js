import Action from 'action-js';

export const requestBep = edge => new Action((cb) => {
  edge.requestBep({
    success: (result) => {
      cb({
        href: result.data,
      });
    },
    error: (err) => {
      cb(new Error(err.message));
    },
  });
});

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

