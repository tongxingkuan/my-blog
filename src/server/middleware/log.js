// 请求日志打印
export default defineEventHandler(async (event) => {
  let cookies, query, body, path, method
  cookies = parseCookies(event)
  path = getRequestPath(event)
  method = getMethod(event)
  if (method === 'GET') {
    query = await getQuery(event)
  } else if (method === 'POST') {
    body = await readBody(event)
  }
  // console.log({
  //   method,
  //   path,
  //   cookies,
  //   query,
  //   body
  // })
})