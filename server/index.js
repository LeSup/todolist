import { Server, Router } from './lib/interceptor/index.js';
import { asset, cookie, param } from './aspect';

const app = new Server();
const router = new Router();

app.use(param);

app.use(cookie);

app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`);
  await next();
})

app.use(route.get('.*', asset));

app.use(router.all('.*', async ({res}, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.body = '<h1>Not Found</h1>';
  res.statusCode = 404;
  await next();
}))

app.listen(3000);