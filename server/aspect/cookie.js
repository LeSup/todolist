export default async function cookie(ctx, next) {
  const req = ctx.req;
  const cookieStr = decodeURIComponent(req.headers.cookie);
  const cookies = cookieStr.split(/\s*;\s*/);
  ctx.cookie = {};
  cookies.forEach(item => {
    const [key, value] = item.split('=');
    ctx.cookie[key] = value;
  });

  await next();
}