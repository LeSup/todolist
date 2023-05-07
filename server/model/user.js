import crypto from "crypto";
import { setSession } from "./session.js";

const salt = "xypte";

async function login(database, ctx, { name, passwd }) {
  passwd = crypto
    .createHash("sha256")
    .update(`${salt}${passwd}`, "utf8")
    .digest()
    .toString("hex");
  const userInfo = await database.get(
    "SELECT * FROM user WHERE name = ? AND password = ?",
    name,
    passwd
  );
  if (userInfo) {
    const data = { id: userInfo.id, name: userInfo.name };
    await setSession(database, ctx, "userInfo", data);
    return data;
  }

  return null;
}

export { login };
