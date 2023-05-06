import http from 'http';
import Interceptor from './interceptor.js';

export default class Server {
  constructor() {
    const interceptor = new Interceptor();

    this.server = http.createServer(async (req, res) => {
      await interceptor.run({ req, res });
      if (!res.writableFinished) {
        let body = res.body || '200 OK';
        if (body.pipe) {
          body.pipe(res);
        } else {
          if (typeof body === 'string' && res.getHeader('Content-Type') === 'application/json') {
            body = JSON.stringify(body);
          }
          res.end(body);
        }
      }
    });

    this.interceptor = interceptor
  }

  listen(opts, cb) {
    if (typeof opts === 'number') {
      opts = { port: opts };
    }
    opts.host ??= '0.0.0.0';
    cb ??= () => console.log('server is listening on ', this.server.address());
    this.server.listen(opts, () => cb(this.server));
  }

  use(aspect) {
    this.interceptor.use(aspect);
    return this;
  }
}