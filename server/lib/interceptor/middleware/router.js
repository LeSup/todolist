import path from 'path';
import url from 'url';

function check(rule, pathname) {
  rule = rule.split(url.req).join('/');
  const ruleExp = new RegExp(`^${rule.replace(/:[^/]+/g, '([^/]+)')}$`);
  const ruleMatch = pathname.match(ruleExp);

  if (ruleMatch) {
    const result = {};
    // /list/:a/:b => [':a', ':b']
    const paramMatch = rule.match(/:[^/]+/g);
    if (paramMatch) {
      for (let i = 0; i < paramMatch.length; i++) {
        result[paramMatch[i].slice(1)] = ruleMatch[i + 1];
      }
    }
    return result;
  }

  return null;
}

function route(method, rule, aspect) {
  return async (ctx, next) => {
    const req = ctx.req;
    if (!ctx.url) {
      ctx.url = url.parse(`http://${req.headers.host}${req.url}`);
    }
    const checked = check(rule, ctx.url.pathname);
    if (!ctx.route && (method === '*' || method === req.method) && !!checked) {
      ctx.route = checked;
      await aspect(ctx, next);
    } else {
      await next();
    }
  }
}

export default class Router {
  constructor(url = '') {
    this.baseUrl = url;
  }

  get(rule, aspect) {
    return route('GET', path.join(this.baseUrl, rule), aspect);
  }

  post(rule, aspect) {
    return route('POST', path.join(this.baseUrl, rule), aspect);
  }

  put(rule, aspect) {
    return route('PUT', path.join(this.baseUrl, rule), aspect);
  }

  delete(rule, aspect) {
    return route('DELETE', path.join(this.baseUrl, rule), aspect);
  }

  all(rule, aspect) {
    return route('*', path.join(this.baseUrl, rule), aspect);
  }
}