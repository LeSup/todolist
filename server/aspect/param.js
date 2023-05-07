import url from "url";
import querystring from "querystring";

export default async function param(ctx, next) {
  const req = ctx.req;
  const { query } = url.parse(req.url);
  ctx.params = querystring.parse(query);

  if (req.method === "POST") {
    const body = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString();
      });

      req.on("end", () => {
        resolve(data);
      });
    });

    ctx.params = ctx.params || {};
    switch (req.headers["content-type"]) {
      case "application/json":
        Object.assign(ctx.params, JSON.parse(body));
        break;
      case "application/x-www-form-urlencoded":
        Object.assign(ctx.params, querystring.parse(body));
        break;
    }
  }

  await next();
}
