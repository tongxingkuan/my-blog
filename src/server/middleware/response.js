import * as fs from "fs";
import * as crytpo from "crypto";
import * as path from "path";
import { cachedApiConfig } from "../data/cacheApiConfig";

export default fromNodeMiddleware((req, res, next) => {
  let idx = cachedApiConfig.findIndex((item) => req.url.indexOf(item.url) > -1);
  if (idx > -1) {
    let config = cachedApiConfig[idx];
    const { filePath, noCache, maxAge } = config;
    if (!noCache && maxAge) {
      // 设置强制缓存
      res.setHeader("Cache-Control", "max-age=" + maxAge);
      next()
    } else if (noCache && filePath) {
      // 设置协商缓存
      // 必须先设置为no-cache，才会启用协商缓存
      res.setHeader("Cache-Control", "no-cache");
      const lastModified = fs.statSync(path.resolve() + filePath).ctime.toGMTString();
      const ifModifiedSince = req.headers['if-modified-since'];
      const ifNoneMatch =  req.headers["if-none-match"];
      fs.readFile(path.resolve() + filePath, function (err, data) {
        if (!err) {
          const etag = crytpo.createHash("md5").update(data).digest("hex");
          // 判断修改时间是否一致
          const isSameCtime = ifModifiedSince === lastModified;
          // 判断文件的MD5是否一致，不一致说明文件内容变更
          const isSameFlag = ifNoneMatch === etag;
          console.log(etag, lastModified)
          // 判断文件是否有改动 两者满足其一则使用浏览器缓存
          if (isSameCtime || isSameFlag) {
            res.statusCode = 304;
          } else {
            res.setHeader("Last-Modified", lastModified);
            res.setHeader("ETag", etag);
          }
          next()
        }
      });
    }
  } else {
    next();
  }
});
