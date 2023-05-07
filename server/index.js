import url from "url";
import path from "path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { Server, Router } from "./lib/interceptor/index.js";
import { asset, cookie, param } from "./aspect/index.js";
import {
  sessionKey,
  getSession,
  login,
  getList,
  addTask,
  updateTask,
} from "./model/index.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const dbFile = path.resolve(__dirname, "../database/todolist.db");

let db;

const app = new Server();
const router = new Router();

app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`);
  await next();
});

// 参数解析
app.use(param);

// cookie解析
app.use(cookie);

// cookie设置
app.use(async ({ cookies, res }, next) => {
  let key = cookies[sessionKey];
  if (!key) {
    key = Math.random().toString(36).slice(2);
  }
  res.setHeader(
    "Set-Cookie",
    `${sessionKey}=${key}; Path=/; Max-Age=${7 * 86400}`
  );
  await next();
});

// 数据库连接
app.use(async (ctx, next) => {
  if (!db) {
    db = await open({
      filename: dbFile,
      driver: sqlite3.cached.Database,
    });
  }
  ctx.database = db;

  await next();
});

app.use(
  router.post("/login", async (ctx, next) => {
    const { database, params, res } = ctx;
    const result = await login(database, ctx, params);
    res.statusCode = 302;
    if (result) {
      res.setHeader("Location", "/");
    } else {
      res.setHeader("Location", "/login.html");
    }
    await next();
  })
);

async function checkLogin(ctx) {
  const { database } = ctx;
  const userInfo = await getSession(database, ctx, "userInfo");
  return userInfo;
}

app.use(
  router.get("/list", async (ctx, next) => {
    const { res, database } = ctx;
    const userInfo = await checkLogin(ctx);
    res.setHeader("Content-Type", "application/json");
    if (userInfo) {
      const data = await getList(database, userInfo);
      res.body = { data };
    } else {
      res.body = { err: "not login" };
    }
    await next();
  })
);

app.use(
  router.post("/add", async (ctx, next) => {
    const { res, params, database } = ctx;
    const userInfo = await checkLogin(ctx);
    res.setHeader("Content-Type", "application/json");
    if (userInfo) {
      const data = await addTask(database, userInfo, params);
      res.body = { data };
    } else {
      res.body = { err: "not login" };
    }
    await next();
  })
);

app.use(
  router.post("/update", async (ctx, next) => {
    const { res, params, database } = ctx;
    const userInfo = await checkLogin(ctx);
    res.setHeader("Content-Type", "application/json");
    if (userInfo) {
      const data = await updateTask(database, params);
      res.body = { data };
    } else {
      res.body = { err: "not login" };
    }
    await next();
  })
);

// 静态文件
app.use(router.get(".*", asset));

app.use(
  router.all(".*", async ({ res }, next) => {
    res.setHeader("Content-Type", "text/html");
    res.body = "<h1>Not Found</h1>";
    res.statusCode = 404;
    await next();
  })
);

app.listen(3000);
