export default async function cookie(ctx, next) {
  const req = ctx.req;
  const cookieStr = decodeURIComponent(req.headers.cookie);
  const cookies = cookieStr.split(/\s*;\s*/);
  ctx.cookies = {};
  cookies.forEach((item) => {
    const [key, value] = item.split("=");
    ctx.cookies[key] = value;
  });

  await next();
}
