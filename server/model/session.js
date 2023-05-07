const sessionKey = "interceptor_js";

async function getSession(database, ctx, name) {
  const key = ctx.cookies[sessionKey];
  if (key) {
    const now = Date.now();
    const session = await database.get(
      "SELECT * FROM session WHERE key = ? and name = ? and expires > ?",
      key,
      name,
      now
    );
    if (session) {
      return JSON.parse(session.value);
    }
  }

  return null;
}

async function setSession(database, ctx, name, data) {
  const key = ctx.cookies[sessionKey];
  try {
    if (key) {
      let result = await database.get(
        "SELECT id FROM session WHERE key = ? and name = ?",
        key,
        name
      );
      if (!result) {
        result = await database.run(
          "INSERT INTO session(key, name, value, created, expires) VALUES (?, ?, ?, ?, ?)",
          key,
          name,
          JSON.stringify(data),
          Date.now(),
          Date.now() + 7 * 86400 * 1000
        );
      } else {
        result = await database.run(
          "UPDATE session SET value = ?, expires = ? WHERE key = ? AND name = ?",
          JSON.stringify(data),
          Date.now() + 7 * 86400 * 1000,
          key,
          name
        );
      }
      return { err: null, result };
    }

    throw new Error("invalidate key");
  } catch (err) {
    return { err: err.message };
  }
}

export { sessionKey, getSession, setSession };
