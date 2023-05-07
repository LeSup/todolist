import path from "path";
import url from "url";
import fs from "fs";
import zlib from "zlib";
import mime from "mime";

export default async function asset({ req, res }, next) {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  let filepath = path.resolve(__dirname, "../../", path.join("www", req.url));

  if (fs.existsSync(filepath)) {
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      filepath = path.join(filepath, "index.html");
    }

    if (fs.existsSync(filepath)) {
      const stat = fs.statSync(filepath);
      const { ext } = path.parse(filepath);
      const mimeType = mime.getType(ext);

      let status = 200;
      const timeStamp = req.headers["if-modified-since"];
      if (timeStamp && Number(timeStamp) === stat.mtimeMs) {
        status = 304;
      }

      const headers = {
        "Cache-Control": "max-age=86400",
        "Last-Modified": stat.mtimeMs,
        "Content-Type": mimeType,
      };

      const acceptEncoding = req.headers["accept-encoding"];
      const needCompress = /^(text|application)/.test(mimeType);
      if (acceptEncoding && needCompress) {
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          switch (encoding) {
            case "gzip":
              headers["Content-Encoding"] = "gzip";
              return true;
            case "deflate":
              headers["Content-Encoding"] = "deflate";
              return true;
            case "br":
              headers["Content-Encoding"] = "br";
              return true;
            default:
              return false;
          }
        });
      }

      res.writeHead(status, headers);

      if (status === 200) {
        const contentEncoding = headers["Content-Encoding"];

        let compressStream;
        switch (contentEncoding) {
          case "gzip":
            compressStream = zlib.createGzip();
            break;
          case "deflate":
            compressStream = zlib.createDeflate();
            break;
          case "br":
            compressStream = zlib.createBrotliCompress();
            break;
        }

        const fileStream = fs.createReadStream(filepath);
        if (compressStream) {
          res.body = fileStream.pipe(compressStream);
        } else {
          res.body = fileStream;
        }
      }

      return;
    }
  } else {
    res.setHeader("Content-Type", "text/html");
    res.body = "<h1>Not Found</h1>";
    res.statusCode = 404;
    return;
  }
}
